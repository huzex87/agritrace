import { createClient } from '@/lib/supabase/server'
import { formatNGN, formatKg } from '@/lib/utils'

export default async function ReceiptsPage() {
  const supabase = await createClient()
  const { data: receipts } = await supabase
    .from('purchase_receipts')
    .select('*, farmer:farmers(full_name, whatsapp_number), batch:harvest_batches(batch_ref, crop_type)')
    .order('issued_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Purchase Receipts</h1>
        <p className="text-sm text-gray-500 mt-0.5">Digital purchase receipts issued to farmers</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Receipt Ref</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Farmer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Batch</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Quantity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price/kg</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">WhatsApp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!receipts?.length && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No receipts yet.</td></tr>
              )}
              {receipts?.map((r) => {
                const farmer = r.farmer as { full_name: string; whatsapp_number: string }
                const batch = r.batch as { batch_ref: string; crop_type: string }
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#1a4d1a]">{r.receipt_ref}</td>
                    <td className="px-4 py-3 font-medium">{farmer?.full_name ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{batch?.batch_ref ?? '—'}</td>
                    <td className="px-4 py-3">{formatKg(r.quantity_kg)}</td>
                    <td className="px-4 py-3">{formatNGN(r.price_per_kg)}</td>
                    <td className="px-4 py-3 font-semibold text-[#1a4d1a]">{formatNGN(r.amount_ngn)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.sent_via_whatsapp ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {r.sent_via_whatsapp ? 'Sent' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(r.issued_at).toLocaleDateString('en-NG')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
