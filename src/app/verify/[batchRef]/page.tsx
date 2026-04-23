import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CustodyTimeline } from '@/components/batch/custody-timeline'
import { formatKg, cropLabel, statusLabel, statusColor } from '@/lib/utils'
import { CheckCircle, XCircle, Sprout } from 'lucide-react'
import type { BatchStatus, CropType } from '@/types'

export default async function VerifyPage({ params }: { params: Promise<{ batchRef: string }> }) {
  const { batchRef } = await params
  const supabase = await createServiceClient()

  const { data: batch } = await supabase
    .from('harvest_batches')
    .select('*, farmer:farmers(full_name, state, lga, farm_size_ha)')
    .eq('batch_ref', batchRef)
    .single()

  if (!batch) notFound()

  const { data: transfers } = await supabase
    .from('transfer_events')
    .select('*')
    .eq('batch_id', batch.id)
    .order('recorded_at', { ascending: true })

  const farmer = batch.farmer as Record<string, string | number>
  const isVerified = !!batch.qr_payload_hash

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a2e1a] text-white px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <Sprout className="w-6 h-6 text-[#7ec850]" />
          <span className="font-bold text-lg">AgriTrace</span>
          <span className="text-white/40 mx-2">·</span>
          <span className="text-sm text-white/60">Batch Verification</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Verification badge */}
        <div className={`rounded-xl p-4 flex items-center gap-3 ${isVerified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {isVerified
            ? <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            : <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />}
          <div>
            <p className={`font-semibold ${isVerified ? 'text-green-800' : 'text-red-700'}`}>
              {isVerified ? 'Verified AgriTrace Batch' : 'Verification Failed'}
            </p>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{batchRef}</p>
          </div>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(batch.status as BatchStatus)}`}>
            {statusLabel(batch.status as BatchStatus)}
          </span>
        </div>

        {/* Batch details */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Commodity Details</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Detail label="Crop" value={cropLabel(batch.crop_type as CropType)} />
            <Detail label="Quantity" value={formatKg(batch.quantity_kg)} />
            <Detail label="Quality Grade" value={batch.quality_grade ?? '—'} />
            <Detail label="Harvest Date" value={batch.harvest_date} />
            {batch.destination && <Detail label="Destination" value={batch.destination} />}
            <Detail label="Registered" value={new Date(batch.created_at).toLocaleDateString('en-NG')} />
          </dl>
        </div>

        {/* Farmer details */}
        {farmer && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Origin</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Detail label="Farmer" value={farmer.full_name as string} />
              <Detail label="State" value={farmer.state as string} />
              <Detail label="LGA" value={farmer.lga as string} />
              {farmer.farm_size_ha && <Detail label="Farm Size" value={`${farmer.farm_size_ha} ha`} />}
            </dl>
          </div>
        )}

        {/* Hash anchor */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Traceability Hash Anchor</p>
          <p className="font-mono text-xs text-gray-600 break-all">{batch.qr_payload_hash}</p>
          <p className="text-xs text-gray-400 mt-1">SHA-256 digest of canonical batch data — immutable record</p>
        </div>

        {/* Chain of custody */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">
            Chain of Custody
            <span className="ml-2 text-xs font-normal text-gray-400">({transfers?.length ?? 0} events)</span>
          </h2>
          <CustodyTimeline events={transfers ?? []} />
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          Verified by AgriTrace · Nigeria&apos;s Agricultural Supply Chain Platform ·{' '}
          <a href="/" className="underline">agritrace.ng</a>
        </p>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="font-medium text-gray-800 mt-0.5">{value}</dd>
    </div>
  )
}
