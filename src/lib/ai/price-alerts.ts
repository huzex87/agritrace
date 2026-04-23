import { createServiceClient } from '@/lib/supabase/server'
import { generatePriceAlertMessage } from './gemini'
import { sendText } from '@/lib/whatsapp/client'
import type { LangPref } from '@/types'

// Called by a daily cron job (Supabase pg_cron or Vercel cron)
export async function dispatchDailyPriceAlerts(): Promise<{ sent: number; errors: number }> {
  const supabase = await createServiceClient()
  let sent = 0
  let errors = 0

  // Get latest price per commodity (past 48h)
  const { data: prices } = await supabase
    .from('market_prices')
    .select('*')
    .eq('is_international', false)
    .gte('recorded_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
    .order('recorded_at', { ascending: false })

  if (!prices || prices.length === 0) return { sent: 0, errors: 0 }

  // Deduplicate: one per commodity
  const seen = new Set<string>()
  const latest = prices.filter((p) => {
    if (seen.has(p.commodity)) return false
    seen.add(p.commodity)
    return true
  })

  // Get all registered farmers with WhatsApp numbers
  const { data: sessions } = await supabase
    .from('whatsapp_sessions')
    .select('phone_number, farmer_id, context_data')
    .not('farmer_id', 'is', null)

  if (!sessions) return { sent: 0, errors: 0 }

  // Pre-generate messages for both languages
  const [msgEn, msgHa] = await Promise.all([
    generatePriceAlertMessage(latest, 'en').catch(() => null),
    generatePriceAlertMessage(latest, 'ha').catch(() => null),
  ])

  for (const session of sessions) {
    const lang: LangPref = (session.context_data?.lang as LangPref) ?? 'en'
    const message = (lang === 'ha' ? msgHa : msgEn) ?? `Today's prices: ${latest.map((p) => `${p.commodity} ₦${p.price_ngn_per_kg}/kg`).join(', ')}`
    try {
      await sendText(session.phone_number, message)
      sent++
      // Rate limit: 1 msg per 50ms to stay within WhatsApp throughput
      await new Promise((r) => setTimeout(r, 50))
    } catch {
      errors++
    }
  }

  return { sent, errors }
}
