import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { createHash } from 'crypto'
import type { CropType, BatchStatus, SubscriptionTier } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNGN(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatKg(kg: number): string {
  return kg >= 1000
    ? `${(kg / 1000).toFixed(2)} tonnes`
    : `${kg.toFixed(1)} kg`
}

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

export function generateBatchRef(state: string, crop: CropType): string {
  const stateCode = state.slice(0, 3).toUpperCase()
  const cropCode = crop === 'castor_seed' ? 'CAS' : crop === 'dried_ginger' ? 'GNG' : crop.slice(0, 3).toUpperCase()
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${stateCode}-${cropCode}-${date}-${rand}`
}

export function computeBatchHash(batch: {
  batch_ref: string
  farmer_id: string
  crop_type: string
  quantity_kg: number
  harvest_date: string
  created_at: string
}): string {
  const canonical = JSON.stringify(batch, Object.keys(batch).sort() as (keyof typeof batch)[])
  return sha256(canonical)
}

export function computeTransferHash(
  batchId: string,
  prevHash: string | null,
  recordedAt: string,
  handlerType: string
): string {
  return sha256(`${batchId}|${prevHash ?? 'GENESIS'}|${recordedAt}|${handlerType}`)
}

export function cropLabel(crop: CropType): string {
  const labels: Record<CropType, string> = {
    sesame: 'Sesame',
    cowpea: 'Cowpea',
    groundnut: 'Groundnut',
    castor_seed: 'Castor Seed',
    dried_ginger: 'Dried Ginger',
    other: 'Other',
  }
  return labels[crop]
}

export function statusLabel(status: BatchStatus): string {
  const labels: Record<BatchStatus, string> = {
    at_farm: 'At Farm',
    in_transit: 'In Transit',
    at_aggregator: 'At Aggregator',
    processing: 'Processing',
    exported: 'Exported',
    sold: 'Sold',
  }
  return labels[status]
}

export function statusColor(status: BatchStatus): string {
  const colors: Record<BatchStatus, string> = {
    at_farm: 'bg-yellow-100 text-yellow-800',
    in_transit: 'bg-blue-100 text-blue-800',
    at_aggregator: 'bg-indigo-100 text-indigo-800',
    processing: 'bg-purple-100 text-purple-800',
    exported: 'bg-green-100 text-green-800',
    sold: 'bg-gray-100 text-gray-800',
  }
  return colors[status]
}

export const TIER_LIMITS: Record<SubscriptionTier, number> = {
  trial: 10,
  starter: 50,
  growth: 250,
  enterprise: Infinity,
}

export const NW_STATES = [
  'Katsina', 'Kano', 'Zamfara', 'Sokoto', 'Kebbi', 'Jigawa', 'Kaduna',
]

export const MARKETS = [
  'Kano-Dawanau', 'Lagos-Mile12', 'Abuja-Gwagwalada', 'Onitsha',
  'Katsina-Central', 'Sokoto-Central', 'Zamfara-Gusau',
]
