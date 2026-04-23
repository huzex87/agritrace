import { NextRequest, NextResponse } from 'next/server'
import { dispatchDailyPriceAlerts } from '@/lib/ai/price-alerts'

// Called by Vercel Cron or Supabase pg_cron via HTTP
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await dispatchDailyPriceAlerts()
  return NextResponse.json({ success: true, ...result })
}
