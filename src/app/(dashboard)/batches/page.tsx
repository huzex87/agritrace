import { createClient } from '@/lib/supabase/server'
import { formatKg, statusColor, statusLabel, cropLabel } from '@/lib/utils'
import Link from 'next/link'
import type { BatchStatus, CropType } from '@/types'

export default async function BatchesPage() {
  const supabase = await createClient()

  const { data: batches } = await supabase
    .from('harvest_batches')
    .select('*, farmer:farmers(full_name, state, lga)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Harvest Batches</h1>
          <p className="text-sm text-gray-500 mt-0.5">{batches?.length ?? 0} total batches</p>
        </div>
        <Link href="/documents/generate" className="px-4 py-2 bg-[#1a4d1a] text-white text-sm rounded-lg font-medium hover:bg-[#1a3d1a] transition-colors">
          Generate Document
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Batch Ref</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Crop</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Farmer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quantity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Harvest Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!batches?.length && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No batches yet. Farmers register batches via WhatsApp.
                  </td>
                </tr>
              )}
              {batches?.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-[#1a4d1a]">{batch.batch_ref}</td>
                  <td className="px-4 py-3 capitalize">{cropLabel(batch.crop_type as CropType)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{(batch.farmer as {full_name: string})?.full_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{(batch.farmer as {state: string; lga: string})?.state}, {(batch.farmer as {state: string; lga: string})?.lga}</p>
                  </td>
                  <td className="px-4 py-3">{formatKg(batch.quantity_kg)}</td>
                  <td className="px-4 py-3 text-gray-500">{batch.harvest_date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(batch.status as BatchStatus)}`}>
                      {statusLabel(batch.status as BatchStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/batches/${batch.id}`} className="text-xs text-[#1a4d1a] hover:underline font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
