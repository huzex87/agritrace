import type { CropType, MarketPrice } from '@/types'
import { cropLabel, formatNGN } from '@/lib/utils'

// ─────────────────────────────────────────
// Bilingual message templates (Hausa / English)
// ─────────────────────────────────────────

export const MSG = {
  welcome: (lang: 'ha' | 'en', name: string) =>
    lang === 'ha'
      ? `Sannu da zuwa AgriTrace, ${name}! 🌾\nAn yi rajista. Yanzu zaka iya rubuta amfanin gona.\nKu rubuta *BATCH* don fara, ko *PRICE* don ganin farashi.`
      : `Welcome to AgriTrace, ${name}! 🌾\nRegistration complete. You can now log your harvest batches.\nType *BATCH* to log a harvest, or *PRICE* for market prices.`,

  askName: (lang: 'ha' | 'en') =>
    lang === 'ha'
      ? `Sannu! Ni ne AgriTrace.\nMenene sunanka cikakke? (Your full name)`
      : `Hello! I'm AgriTrace.\nPlease enter your full name:`,

  askState: (lang: 'ha' | 'en') =>
    lang === 'ha'
      ? `Yaya ake kiran jihar da kake zaune? Misali: Katsina, Kano, Zamfara`
      : `Which state are you in?\nExample: Katsina, Kano, Zamfara`,

  askLGA: (lang: 'ha' | 'en') =>
    lang === 'ha'
      ? `Menene LGA (Ƙaramar Hukuma) naka?`
      : `What is your Local Government Area (LGA)?`,

  askCrops: (lang: 'ha' | 'en') =>
    lang === 'ha'
      ? `Wane amfanin gona kake nomawa? Zabi daya ko fiye:\n1️⃣ Ridi (Sesame)\n2️⃣ Wake (Cowpea)\n3️⃣ Gyada (Groundnut)\n4️⃣ Dorawa (Castor Seed)\n5️⃣ Citta (Dried Ginger)\n\nAika lambobi kamar: 1 3 (don Ridi da Gyada)`
      : `What crops do you farm? Reply with numbers (e.g. 1 3):\n1️⃣ Sesame\n2️⃣ Cowpea\n3️⃣ Groundnut\n4️⃣ Castor Seed\n5️⃣ Dried Ginger`,

  askFarmSize: (lang: 'ha' | 'en') =>
    lang === 'ha'
      ? `Nawa ne girman gonarka a hectares? (Misali: 2.5)\nIn ba ka sani ba, aika *skip*`
      : `What is your farm size in hectares? (e.g. 2.5)\nType *skip* if unknown`,

  confirmRegistration: (lang: 'ha' | 'en', data: { name: string; state: string; lga: string; crops: string }) =>
    lang === 'ha'
      ? `Tabbatar rajista:\n👤 Suna: ${data.name}\n📍 Jiha: ${data.state} — ${data.lga}\n🌾 Amfanin gona: ${data.crops}\n\nTabbatacce? Aika *YES* ko *NO*`
      : `Confirm your registration:\n👤 Name: ${data.name}\n📍 Location: ${data.state} — ${data.lga}\n🌾 Crops: ${data.crops}\n\nConfirm? Reply *YES* or *NO*`,

  askBatchCrop: (lang: 'ha' | 'en') =>
    lang === 'ha'
      ? `Wane amfanin gona ne wannan kunci?\n1️⃣ Ridi\n2️⃣ Wake\n3️⃣ Gyada\n4️⃣ Dorawa\n5️⃣ Citta\n6️⃣ Wani abu`
      : `Which crop is this batch?\n1️⃣ Sesame\n2️⃣ Cowpea\n3️⃣ Groundnut\n4️⃣ Castor Seed\n5️⃣ Dried Ginger\n6️⃣ Other`,

  askBatchQuantity: (lang: 'ha' | 'en') =>
    lang === 'ha'
      ? `Nawa nauyin kunci (kg)? Misali: 500`
      : `What is the batch weight in kg? (e.g. 500)`,

  askBatchQuality: (lang: 'ha' | 'en') =>
    lang === 'ha'
      ? `Wane daraja ne kuncin?\n🅰️ Mafi kyau (Grade A)\n🅱️ Matsakaici (Grade B)\n🅾️ Ka fara (Grade C)`
      : `What is the quality grade?\n🅰️ Grade A — Premium\n🅱️ Grade B — Standard\n🅾️ Grade C — Basic`,

  askBatchDate: (lang: 'ha' | 'en') =>
    lang === 'ha'
      ? `Yaushe aka girbe? Aika kwanan wata (YYYY-MM-DD) Misali: 2026-04-15`
      : `When was this harvested? Enter date (YYYY-MM-DD) e.g. 2026-04-15`,

  askBatchDestination: (lang: 'ha' | 'en') =>
    lang === 'ha'
      ? `Ina ake kai wannan kunci? (Misali: Dawanau Kano)\nIn ba a san ba, aika *skip*`
      : `Where is this batch going? (e.g. Dawanau Kano)\nType *skip* if unknown`,

  batchCreated: (lang: 'ha' | 'en', batchRef: string) =>
    lang === 'ha'
      ? `✅ An yi rijista kuncin!\n\n📋 Lambar kunci: *${batchRef}*\n\nAn aika QR code. Riƙe shi tare da kuncin a kowane lokaci.\n\nAika *BATCH* don sabon kunci.`
      : `✅ Batch registered!\n\n📋 Batch Reference: *${batchRef}*\n\nYour QR code has been generated. Keep it with the batch at all times.\n\nType *BATCH* to log another batch.`,

  priceAlert: (lang: 'ha' | 'en', prices: MarketPrice[]) => {
    const lines = prices.map(
      (p) => `${lang === 'ha' ? cropHausa(p.commodity) : cropLabel(p.commodity)}: ₦${p.price_ngn_per_kg}/kg (${p.market_location})`
    )
    return lang === 'ha'
      ? `📊 *Farashin Yau*\n${lines.join('\n')}\n\n_AgriTrace — Bayani na gaskiya_`
      : `📊 *Today's Market Prices*\n${lines.join('\n')}\n\n_AgriTrace — Fair market intelligence_`
  },

  notRegistered: (lang: 'ha' | 'en') =>
    lang === 'ha'
      ? `Ba a yi rajistarka ba tukuna. Aika *REGISTER* don farawa.`
      : `You are not registered yet. Type *REGISTER* to get started.`,

  invalidInput: (lang: 'ha' | 'en') =>
    lang === 'ha'
      ? `Ba a gane wannan. Da fatan za a sake kokarin.`
      : `I didn't understand that. Please try again.`,

  mainMenu: (lang: 'ha' | 'en') =>
    lang === 'ha'
      ? `Menene kake so?\n\n🌾 *BATCH* — Rijista sabon kunci\n📊 *PRICE* — Farashi na yau\n📦 *STATUS* — Duba kunci\n📞 *HELP* — Taimako`
      : `What would you like to do?\n\n🌾 *BATCH* — Log a new harvest batch\n📊 *PRICE* — Today's market prices\n📦 *STATUS* — Check batch status\n📞 *HELP* — Help & support`,
}

const CROP_HAUSA: Record<string, string> = {
  sesame: 'Ridi',
  cowpea: 'Wake',
  groundnut: 'Gyada',
  castor_seed: 'Dorawa',
  dried_ginger: 'Citta',
  other: 'Wani abu',
}

export function cropHausa(crop: string): string {
  return CROP_HAUSA[crop] ?? crop
}

export const CROP_MAP: Record<string, CropType> = {
  '1': 'sesame',
  '2': 'cowpea',
  '3': 'groundnut',
  '4': 'castor_seed',
  '5': 'dried_ginger',
  '6': 'other',
}

export const QUALITY_MAP: Record<string, 'A' | 'B' | 'C'> = {
  a: 'A', '1': 'A', 'grade a': 'A',
  b: 'B', '2': 'B', 'grade b': 'B',
  c: 'C', '3': 'C', 'grade c': 'C',
}
