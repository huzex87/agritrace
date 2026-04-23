import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CustodyTimeline } from '@/components/batch/custody-timeline'
import { formatKg, formatNGN, statusColor, statusLabel, cropLabel } from '@/lib/utils'
import Link from 'next/link'
import type { BatchStatus, CropType } from '@/types'

export default async function BatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [batchRes, transferRes] = await Promise.all([
    supabase.from('harvest_batches')
      .select('*, farmer:farmers(*)')
      .eq('id', id)
      .single(),
    supabase.from('transfer_events')
      .select('*')
      .eq('batch_id', id)
      .order('recorded_at', { ascending: true }),
  ])

  if (!batchRes.data) notFound()

  const batch = batchRes.data
  const transfers = transferRes.data ?? []
  const farmer = batch.farmer as Record<string, string>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/batches" className="text-xs text-gray-400 hover:text-[#1a4d1a]">← Back to Batches</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{batch.batch_ref}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${statusColor(batch.status as BatchStatus)}`}>
            {statusLabel(batch.status as BatchStatus)}
          </span>
        </div>
        <Link
          href={`/verify/${batch.batch_ref}`}
          target="_blank"
          className="text-xs px-3 py-1.5 border border-[#1a4d1a] text-[#1a4d1a] rounded-lg hover:bg-green-50 transition-colors"
        >
          Public Verify ↗
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Commodity details */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Commodity</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Crop" value={cropLabel(batch.crop_type as CropType)} />
            <Row label="Quantity" value={formatKg(batch.quantity_kg)} />
            <Row label="Quality Grade" value={batch.quality_grade ?? '—'} />
            <Row label="Harvest Date" value={batch.harvest_date} />
            <Row label="Destination" value={batch.destination ?? '—'} />
            {batch.purchase_price && <Row label="Purchase Price" value={formatNGN(batch.purchase_price)} />}
          </dl>
        </div>

        {/* Farmer details */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Farmer</h2>
          {farmer ? (
            <dl className="space-y-2 text-sm">
              <Row label="Name" value={farmer.full_name} />
              <Row label="Location" value={`${farmer.state}, ${farmer.lga}`} />
              <Row label="Farm Size" value={farmer.farm_size_ha ? `${farmer.farm_size_ha} ha` : '—'} />
              <Row label="WhatsApp" value={farmer.whatsapp_number} />
            </dl>
          ) : <p className="text-sm text-gray-400">Farmer details unavailable.</p>}
        </div>
      </div>

      {/* Traceability hash */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Traceability Hash</h2>
        <p className="font-mono text-xs text-gray-600 break-all">{batch.qr_payload_hash}</p>
        <p className="text-xs text-gray-400 mt-1">SHA-256 of canonical batch data — tamper-evident anchor</p>
      </div>

      {/* Chain of custody */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Chain of Custody ({transfers.length} events)</h2>
        <CustodyTimeline events={transfers} />
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-400">{label}</dt>
      <dd className="font-medium text-gray-800">{value}</dd>
    </div>
  )
}
