export type CropType = 'sesame' | 'cowpea' | 'groundnut' | 'castor_seed' | 'dried_ginger' | 'other'
export type QualityGrade = 'A' | 'B' | 'C'
export type BatchStatus = 'at_farm' | 'in_transit' | 'at_aggregator' | 'processing' | 'exported' | 'sold'
export type HandlerType = 'farmer' | 'transporter' | 'aggregator' | 'processor' | 'exporter' | 'buyer'
export type DocType = 'certificate_of_origin' | 'phytosanitary' | 'aflatoxin_compliance' | 'batch_manifest'
export type SubscriptionTier = 'trial' | 'starter' | 'growth' | 'enterprise'
export type LangPref = 'ha' | 'en'
export type PriceSource = 'crowdsourced' | 'commodity_ng' | 'lcfe' | 'world_bank' | 'manual'

export interface Aggregator {
  id: string
  user_id: string
  company_name: string
  nepc_reg: string | null
  state: string
  lga: string | null
  phone: string | null
  subscription_tier: SubscriptionTier
  subscription_status: 'active' | 'expired' | 'cancelled'
  subscription_ends_at: string | null
  paystack_customer_code: string | null
  paystack_sub_code: string | null
  monthly_batch_count: number
  created_at: string
}

export interface Farmer {
  id: string
  whatsapp_number: string
  full_name: string
  state: string
  lga: string
  farm_size_ha: number | null
  crop_types: CropType[]
  lang_pref: LangPref
  onboarded_by: string | null
  is_active: boolean
  created_at: string
}

export interface HarvestBatch {
  id: string
  farmer_id: string
  aggregator_id: string | null
  crop_type: CropType
  quantity_kg: number
  quality_grade: QualityGrade | null
  harvest_date: string
  destination: string | null
  batch_ref: string
  qr_payload_hash: string
  qr_storage_path: string | null
  purchase_price: number | null
  status: BatchStatus
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  farmer?: Farmer
}

export interface TransferEvent {
  id: string
  batch_id: string
  from_party: string | null
  to_party: string
  handler_type: HandlerType
  location: string | null
  notes: string | null
  event_hash: string
  prev_event_hash: string | null
  recorded_via: 'whatsapp' | 'dashboard' | 'api'
  recorded_at: string
}

export interface MarketPrice {
  id: string
  commodity: CropType
  market_location: string
  price_ngn_per_kg: number
  source: PriceSource
  is_international: boolean
  currency: string
  submitted_by: string | null
  recorded_at: string
}

export interface ExportDocument {
  id: string
  aggregator_id: string
  batch_ids: string[]
  doc_type: DocType
  generated_pdf_path: string | null
  status: 'draft' | 'generated' | 'submitted' | 'approved'
  buyer_name: string | null
  destination_country: string | null
  created_at: string
}

export interface PurchaseReceipt {
  id: string
  aggregator_id: string
  batch_id: string
  farmer_id: string
  amount_ngn: number
  quantity_kg: number
  price_per_kg: number
  receipt_ref: string
  sent_via_whatsapp: boolean
  issued_at: string
  // joined
  farmer?: Farmer
  batch?: HarvestBatch
}

export interface WhatsAppSession {
  phone_number: string
  flow_state: FlowState
  context_data: Record<string, unknown>
  farmer_id: string | null
  aggregator_id: string | null
  last_activity: string
}

export type FlowState =
  | 'IDLE'
  | 'REGISTER_NAME'
  | 'REGISTER_STATE'
  | 'REGISTER_LGA'
  | 'REGISTER_CROP_TYPES'
  | 'REGISTER_FARM_SIZE'
  | 'REGISTER_CONFIRM'
  | 'BATCH_CROP'
  | 'BATCH_QUANTITY'
  | 'BATCH_QUALITY'
  | 'BATCH_DATE'
  | 'BATCH_DESTINATION'
  | 'BATCH_CONFIRM'
  | 'TRANSFER_BATCH_REF'
  | 'TRANSFER_TO_PARTY'
  | 'TRANSFER_HANDLER_TYPE'
  | 'TRANSFER_LOCATION'
  | 'TRANSFER_CONFIRM'

export interface WhatsAppMessage {
  object: string
  entry: WhatsAppEntry[]
}

export interface WhatsAppEntry {
  id: string
  changes: WhatsAppChange[]
}

export interface WhatsAppChange {
  value: WhatsAppValue
  field: string
}

export interface WhatsAppValue {
  messaging_product: string
  metadata: { display_phone_number: string; phone_number_id: string }
  contacts?: Array<{ profile: { name: string }; wa_id: string }>
  messages?: InboundMessage[]
  statuses?: MessageStatus[]
}

export interface InboundMessage {
  from: string
  id: string
  timestamp: string
  type: 'text' | 'interactive' | 'image' | 'button'
  text?: { body: string }
  interactive?: {
    type: 'button_reply' | 'list_reply'
    button_reply?: { id: string; title: string }
    list_reply?: { id: string; title: string }
  }
}

export interface MessageStatus {
  id: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  timestamp: string
  recipient_id: string
}

export interface BatchTierLimit {
  trial: number
  starter: number
  growth: number
  enterprise: number
}
