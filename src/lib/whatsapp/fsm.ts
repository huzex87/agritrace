import { createServiceClient } from '@/lib/supabase/server'
import { sendText, sendImage } from './client'
import { MSG, CROP_MAP, QUALITY_MAP } from './messages'
import { generateBatchRef, computeBatchHash, computeTransferHash } from '@/lib/utils'
import { generateBatchQR } from '@/lib/qr/generator'
import type { FlowState, CropType, WhatsAppSession, LangPref } from '@/types'

// ─────────────────────────────────────────
// FSM entry point — called by webhook handler
// ─────────────────────────────────────────
export async function handleMessage(phone: string, text: string): Promise<void> {
  const supabase = await createServiceClient()
  const normalized = text.trim().toLowerCase()

  // Load or create session
  const { data: sessionRow } = await supabase
    .from('whatsapp_sessions')
    .select('*')
    .eq('phone_number', phone)
    .single()

  const session: WhatsAppSession = sessionRow ?? {
    phone_number: phone,
    flow_state: 'IDLE',
    context_data: {},
    farmer_id: null,
    aggregator_id: null,
    last_activity: new Date().toISOString(),
  }

  const lang: LangPref = (session.context_data.lang as LangPref) ?? 'en'

  // Global commands override any flow state
  if (['hi', 'hello', 'start', 'menu', 'help'].includes(normalized)) {
    if (!session.farmer_id) {
      await updateSession(supabase, phone, 'REGISTER_NAME', {})
      await sendText(phone, MSG.askName(lang))
      return
    }
    await updateSession(supabase, phone, 'IDLE', session.context_data)
    await sendText(phone, MSG.mainMenu(lang))
    return
  }

  if (normalized === 'register') {
    await updateSession(supabase, phone, 'REGISTER_NAME', {})
    await sendText(phone, MSG.askName(lang))
    return
  }

  if (normalized === 'batch') {
    if (!session.farmer_id) {
      await sendText(phone, MSG.notRegistered(lang))
      return
    }
    await updateSession(supabase, phone, 'BATCH_CROP', session.context_data)
    await sendText(phone, MSG.askBatchCrop(lang))
    return
  }

  if (normalized === 'price') {
    await handlePriceRequest(supabase, phone, lang)
    return
  }

  // State machine transitions
  switch (session.flow_state as FlowState) {
    case 'IDLE':
      await sendText(phone, MSG.mainMenu(lang))
      break

    // ── REGISTRATION FLOW ──────────────────
    case 'REGISTER_NAME':
      if (text.length < 2) { await sendText(phone, MSG.invalidInput(lang)); return }
      await updateSession(supabase, phone, 'REGISTER_STATE', { ...session.context_data, name: text.trim() })
      await sendText(phone, MSG.askState(lang))
      break

    case 'REGISTER_STATE': {
      await updateSession(supabase, phone, 'REGISTER_LGA', { ...session.context_data, state: text.trim() })
      await sendText(phone, MSG.askLGA(lang))
      break
    }

    case 'REGISTER_LGA':
      await updateSession(supabase, phone, 'REGISTER_CROP_TYPES', { ...session.context_data, lga: text.trim() })
      await sendText(phone, MSG.askCrops(lang))
      break

    case 'REGISTER_CROP_TYPES': {
      const cropNums = text.trim().split(/\s+/)
      const crops = cropNums.map((n) => CROP_MAP[n]).filter(Boolean) as CropType[]
      if (crops.length === 0) { await sendText(phone, MSG.invalidInput(lang)); return }
      await updateSession(supabase, phone, 'REGISTER_FARM_SIZE', { ...session.context_data, crop_types: crops })
      await sendText(phone, MSG.askFarmSize(lang))
      break
    }

    case 'REGISTER_FARM_SIZE': {
      const size = normalized === 'skip' ? null : parseFloat(text)
      const ctx = { ...session.context_data, farm_size_ha: isNaN(size as number) ? null : size }
      await updateSession(supabase, phone, 'REGISTER_CONFIRM', ctx)
      const data = session.context_data as { name: string; state: string; lga: string; crop_types: CropType[] }
      await sendText(phone, MSG.confirmRegistration(lang, {
        name: data.name,
        state: data.state,
        lga: data.lga,
        crops: data.crop_types.map((c) => c).join(', '),
      }))
      break
    }

    case 'REGISTER_CONFIRM': {
      if (!['yes', 'y'].includes(normalized)) {
        await updateSession(supabase, phone, 'IDLE', {})
        await sendText(phone, lang === 'ha' ? 'An soke. Aika REGISTER don sake fara.' : 'Cancelled. Type REGISTER to start over.')
        return
      }
      const ctx = session.context_data as {
        name: string; state: string; lga: string; crop_types: CropType[]; farm_size_ha: number | null
      }
      const { data: farmer, error } = await supabase.from('farmers').insert({
        whatsapp_number: phone,
        full_name: ctx.name,
        state: ctx.state,
        lga: ctx.lga,
        crop_types: ctx.crop_types,
        farm_size_ha: ctx.farm_size_ha,
        lang_pref: lang,
      }).select().single()
      if (error) { console.error('[FSM] farmer insert:', error); await sendText(phone, MSG.invalidInput(lang)); return }
      await updateSession(supabase, phone, 'IDLE', { lang }, farmer.id)
      await sendText(phone, MSG.welcome(lang, ctx.name))
      break
    }

    // ── BATCH LOGGING FLOW ─────────────────
    case 'BATCH_CROP': {
      const crop = CROP_MAP[text.trim()]
      if (!crop) { await sendText(phone, MSG.invalidInput(lang)); return }
      await updateSession(supabase, phone, 'BATCH_QUANTITY', { ...session.context_data, crop_type: crop })
      await sendText(phone, MSG.askBatchQuantity(lang))
      break
    }

    case 'BATCH_QUANTITY': {
      const qty = parseFloat(text)
      if (isNaN(qty) || qty <= 0) { await sendText(phone, MSG.invalidInput(lang)); return }
      await updateSession(supabase, phone, 'BATCH_QUALITY', { ...session.context_data, quantity_kg: qty })
      await sendText(phone, MSG.askBatchQuality(lang))
      break
    }

    case 'BATCH_QUALITY': {
      const grade = QUALITY_MAP[normalized]
      if (!grade) { await sendText(phone, MSG.invalidInput(lang)); return }
      await updateSession(supabase, phone, 'BATCH_DATE', { ...session.context_data, quality_grade: grade })
      await sendText(phone, MSG.askBatchDate(lang))
      break
    }

    case 'BATCH_DATE': {
      const dateVal = text.trim()
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) { await sendText(phone, MSG.invalidInput(lang)); return }
      await updateSession(supabase, phone, 'BATCH_DESTINATION', { ...session.context_data, harvest_date: dateVal })
      await sendText(phone, MSG.askBatchDestination(lang))
      break
    }

    case 'BATCH_DESTINATION': {
      const dest = normalized === 'skip' ? null : text.trim()
      await updateSession(supabase, phone, 'BATCH_CONFIRM', { ...session.context_data, destination: dest })
      // Auto-confirm and create batch
      await createBatch(supabase, phone, session, lang)
      break
    }

    default:
      await updateSession(supabase, phone, 'IDLE', session.context_data)
      await sendText(phone, MSG.mainMenu(lang))
  }
}

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
async function updateSession(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  phone: string,
  state: FlowState,
  context: Record<string, unknown>,
  farmerId?: string
) {
  await supabase.from('whatsapp_sessions').upsert({
    phone_number: phone,
    flow_state: state,
    context_data: context,
    ...(farmerId ? { farmer_id: farmerId } : {}),
    last_activity: new Date().toISOString(),
  })
}

async function handlePriceRequest(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  phone: string,
  lang: LangPref
) {
  const { data: prices } = await supabase
    .from('market_prices')
    .select('*')
    .eq('is_international', false)
    .order('recorded_at', { ascending: false })
    .limit(5)

  if (!prices || prices.length === 0) {
    await sendText(phone, lang === 'ha' ? 'Babu farashi a yanzu. Sake duba daga baya.' : 'No prices available right now. Check back later.')
    return
  }

  // Deduplicate: one price per commodity
  const seen = new Set<string>()
  const deduped = prices.filter((p) => {
    if (seen.has(p.commodity)) return false
    seen.add(p.commodity)
    return true
  })

  await sendText(phone, MSG.priceAlert(lang, deduped))
}

async function createBatch(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  phone: string,
  session: WhatsAppSession,
  lang: LangPref
) {
  const ctx = session.context_data as {
    crop_type: CropType; quantity_kg: number; quality_grade: 'A' | 'B' | 'C';
    harvest_date: string; destination: string | null
  }

  const { data: farmer } = await supabase.from('farmers').select('state').eq('id', session.farmer_id!).single()
  const batchRef = generateBatchRef(farmer?.state ?? 'NGA', ctx.crop_type)
  const createdAt = new Date().toISOString()

  const hash = computeBatchHash({
    batch_ref: batchRef,
    farmer_id: session.farmer_id!,
    crop_type: ctx.crop_type,
    quantity_kg: ctx.quantity_kg,
    harvest_date: ctx.harvest_date,
    created_at: createdAt,
  })

  const { data: batch, error } = await supabase.from('harvest_batches').insert({
    farmer_id: session.farmer_id!,
    crop_type: ctx.crop_type,
    quantity_kg: ctx.quantity_kg,
    quality_grade: ctx.quality_grade,
    harvest_date: ctx.harvest_date,
    destination: ctx.destination,
    batch_ref: batchRef,
    qr_payload_hash: hash,
    status: 'at_farm',
  }).select().single()

  if (error) {
    console.error('[FSM] batch insert:', error)
    await sendText(phone, MSG.invalidInput(lang))
    return
  }

  // Genesis transfer event
  const transferHash = computeTransferHash(batch.id, null, createdAt, 'farmer')
  await supabase.from('transfer_events').insert({
    batch_id: batch.id,
    from_party: null,
    to_party: phone,
    handler_type: 'farmer',
    event_hash: transferHash,
    prev_event_hash: null,
    recorded_via: 'whatsapp',
  })

  // Generate QR code and upload to Storage
  try {
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${batchRef}`
    const qrPath = await generateBatchQR(batchRef, verifyUrl, supabase)
    if (qrPath) {
      await supabase.from('harvest_batches').update({ qr_storage_path: qrPath }).eq('id', batch.id)
      const { data: { publicUrl } } = supabase.storage.from('qrcodes').getPublicUrl(qrPath)
      await sendImage(phone, publicUrl, `AgriTrace QR — ${batchRef}`)
    }
  } catch (e) {
    console.error('[FSM] QR generation failed:', e)
  }

  await updateSession(supabase, phone, 'IDLE', { lang: session.context_data.lang })
  await sendText(phone, MSG.batchCreated(lang, batchRef))
}
