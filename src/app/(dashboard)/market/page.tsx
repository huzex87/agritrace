import { createClient } from '@/lib/supabase/server'
import { formatNGN } from '@/lib/utils'
import type { CropType } from '@/types'

const CROPS: CropType[] = ['sesame', 'cowpea', 'groundnut', 'castor_seed', 'dried_ginger']
const CROP_LABELS: Record<CropType, string> = {
  sesame: 'Sesame (Ridi)', cowpea: 'Cowpea (Wake)', groundnut: 'Groundnut (Gyada)',
  castor_seed: 'Castor Seed (Dorawa)', dried_ginger: 'Dried Ginger (Citta)', other: 'Other',
}

export default async function MarketPage() {
  const supabase = await createClient()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: prices } = await supabase
    .from('market_prices')
    .select('*')
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: false })
    .limit(200)

  // Latest per commodity
  type PriceRow = NonNullable<typeof prices>[0]
  const latest: Record<string, PriceRow> = {}
  for (const p of prices ?? []) {
    if (!latest[p.commodity]) latest[p.commodity] = p
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Market Prices</h1>
        <p className="text-sm text-gray-500 mt-0.5">Live commodity intelligence for Northwest Nigeria and export markets</p>
      </div>

      {/* Current prices grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {CROPS.map((crop) => {
          const p = latest[crop]
          return (
            <div key={crop} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{CROP_LABELS[crop]}</p>
              {p ? (
                <>
                  <p className="text-2xl font-bold text-[#1a4d1a] mt-1">{formatNGN(p.price_ngn_per_kg)}<span className="text-sm font-normal text-gray-400">/kg</span></p>
                  <p className="text-xs text-gray-400 mt-1">{p.market_location}</p>
                  <p className="text-xs text-gray-300">{new Date(p.recorded_at).toLocaleDateString('en-NG')}</p>
                </>
              ) : (
                <p className="text-sm text-gray-300 mt-2">No data yet</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Price history table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Price History (7 days)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Commodity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Market</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Source</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!prices?.length && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No price data for the past 7 days.</td></tr>
              )}
              {prices?.slice(0, 50).map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 capitalize font-medium">{CROP_LABELS[p.commodity as CropType] ?? p.commodity}</td>
                  <td className="px-4 py-3 text-gray-500">{p.market_location} {p.is_international && <span className="text-xs bg-blue-50 text-blue-600 px-1 rounded">Intl</span>}</td>
                  <td className="px-4 py-3 font-semibold text-[#1a4d1a]">{formatNGN(p.price_ngn_per_kg)}/kg</td>
                  <td className="px-4 py-3 text-xs text-gray-400 capitalize">{p.source.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.recorded_at).toLocaleString('en-NG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
