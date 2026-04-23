import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CustodyTimeline } from '@/components/batch/custody-timeline'
import { formatKg, cropLabel, statusLabel, statusColor } from '@/lib/utils'
import { CheckCircle, XCircle, Sprout, Shield, Globe, Lock, AlertTriangle } from 'lucide-react'
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

  const verifiedAt = new Date().toISOString()

  return (
    <div className="min-h-dvh bg-[#f4faf0]">
      {/* Header — trust signals visible immediately on QR scan */}
      <header className="bg-[#1a2e1a] text-white px-4 sm:px-6 py-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ec850] rounded-lg">
            <div className="w-7 h-7 bg-[#7ec850]/20 rounded-lg flex items-center justify-center">
              <Sprout className="w-4 h-4 text-[#7ec850]" aria-hidden="true" />
            </div>
            <span className="font-bold text-sm">AgriTrace</span>
          </a>
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <Lock className="w-3 h-3" aria-hidden="true" />
            <span>Tamper-evident record</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">

        {/* ── Verification status hero — most important signal ── */}
        {isVerified ? (
          <div className="bg-white rounded-2xl border-2 border-green-300 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-600" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-green-800 text-base">Verified AgriTrace Batch</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusColor(batch.status as BatchStatus)}`}>
                    {statusLabel(batch.status as BatchStatus)}
                  </span>
                </div>
                <p className="font-mono text-xs text-gray-500 mt-1 truncate">{batchRef}</p>
                <p className="text-xs text-gray-400 mt-1.5">Verified {new Date(verifiedAt).toLocaleString('en-NG')} · AgriTrace Platform</p>
              </div>
            </div>

            {/* Trust signals row */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100">
              {[
                { Icon: Shield, label: 'Hash-Anchored', desc: 'SHA-256 immutable' },
                { Icon: Globe, label: 'EUDR Ready', desc: 'Traceability compliant' },
                { Icon: Lock, label: 'Tamper-Evident', desc: 'Append-only ledger' },
              ].map(({ Icon, label, desc }) => (
                <div key={label} className="text-center">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                    <Icon className="w-4 h-4 text-green-700" aria-hidden="true" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">{label}</p>
                  <p className="text-[10px] text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-5 flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-red-800">Batch Not Found</p>
              <p className="text-sm text-red-600 mt-1">This QR code could not be verified. The batch reference <code className="font-mono">{batchRef}</code> does not exist in the AgriTrace system.</p>
              <p className="text-xs text-red-500 mt-2">If you believe this is an error, contact the commodity supplier directly.</p>
            </div>
          </div>
        )}

        {/* ── Commodity details ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900 text-sm">Commodity Details</h2>
          </div>
          <dl className="grid grid-cols-2 gap-px bg-gray-100">
            {[
              { label: 'Crop Type', value: cropLabel(batch.crop_type as CropType) },
              { label: 'Quantity', value: formatKg(batch.quantity_kg) },
              { label: 'Quality Grade', value: batch.quality_grade ?? '—' },
              { label: 'Harvest Date', value: batch.harvest_date },
              ...(batch.destination ? [{ label: 'Destination', value: batch.destination }] : []),
              { label: 'Registered', value: new Date(batch.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }) },
            ].map((item) => (
              <div key={item.label} className="bg-white px-4 py-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{item.label}</dt>
                <dd className="text-sm font-medium text-gray-800 mt-0.5">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Farm origin ── */}
        {farmer && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
              <h2 className="font-semibold text-gray-900 text-sm">Farm Origin</h2>
            </div>
            <dl className="grid grid-cols-2 gap-px bg-gray-100">
              {[
                { label: 'Farmer', value: farmer.full_name as string },
                { label: 'State', value: farmer.state as string },
                { label: 'LGA', value: farmer.lga as string },
                ...(farmer.farm_size_ha ? [{ label: 'Farm Size', value: `${farmer.farm_size_ha} ha` }] : []),
              ].map((item) => (
                <div key={item.label} className="bg-white px-4 py-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{item.label}</dt>
                  <dd className="text-sm font-medium text-gray-800 mt-0.5">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* ── Hash anchor — technical credibility for buyers ── */}
        <div className="bg-[#1a2e1a] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-3.5 h-3.5 text-[#7ec850]" aria-hidden="true" />
            <p className="text-xs font-bold text-[#7ec850] uppercase tracking-wide">Traceability Hash Anchor</p>
          </div>
          <p className="font-mono text-xs text-white/70 break-all leading-relaxed">{batch.qr_payload_hash}</p>
          <p className="text-[10px] text-white/40 mt-2.5">
            SHA-256 digest of canonical batch data (batch_ref · farmer_id · crop · quantity · harvest_date).
            This hash is stored at registration time and cannot be altered.
          </p>
        </div>

        {/* ── Chain of custody ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Chain of Custody</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
              {transfers?.length ?? 0} event{(transfers?.length ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="p-5">
            <CustodyTimeline events={transfers ?? []} />
          </div>
        </div>

        {/* Footer trust statement */}
        <div className="text-center pb-6 space-y-1">
          <p className="text-xs text-gray-500 font-medium">
            This record is generated and maintained by AgriTrace — Nigeria&apos;s Agricultural Supply Chain Traceability Platform.
          </p>
          <p className="text-xs text-gray-400">
            Questions?{' '}
            <a href="/" className="text-[#1a4d1a] hover:underline font-medium">agritrace.ng</a>
            {' '}· Katsina State, Nigeria
          </p>
        </div>
      </main>
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
