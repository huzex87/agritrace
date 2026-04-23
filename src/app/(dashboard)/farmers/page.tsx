import { createClient } from '@/lib/supabase/server'
import { cropLabel } from '@/lib/utils'
import type { CropType } from '@/types'

export default async function FarmersPage() {
  const supabase = await createClient()
  const { data: farmers } = await supabase
    .from('farmers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Farmers</h1>
        <p className="text-sm text-gray-500 mt-0.5">{farmers?.length ?? 0} farmers in your network</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        Farmers self-register via the AgriTrace WhatsApp bot. Share your WhatsApp number and ask them to send <strong>REGISTER</strong> to get started.
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">WhatsApp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Crops</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Farm Size</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Language</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!farmers?.length && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    No farmers registered yet.
                  </td>
                </tr>
              )}
              {farmers?.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{f.full_name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{f.whatsapp_number}</td>
                  <td className="px-4 py-3">
                    <p>{f.state}</p>
                    <p className="text-xs text-gray-400">{f.lga}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(f.crop_types as CropType[]).map((c) => (
                        <span key={c} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{cropLabel(c)}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{f.farm_size_ha ? `${f.farm_size_ha} ha` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold uppercase">{f.lang_pref}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(f.created_at).toLocaleDateString('en-NG')}
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
