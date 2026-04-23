import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Package, Users, FileText, TrendingUp, Wheat, AlertCircle } from 'lucide-react'
import { formatKg, formatNGN, statusColor, statusLabel, TIER_LIMITS } from '@/lib/utils'
import Link from 'next/link'
import type { SubscriptionTier, BatchStatus } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [aggRes, batchRes, farmerRes, priceRes] = await Promise.all([
    supabase.from('aggregators').select('*').eq('user_id', user!.id).single(),
    supabase.from('harvest_batches').select('id, status, quantity_kg, crop_type, created_at', { count: 'exact' }),
    supabase.from('farmers').select('id', { count: 'exact' }),
    supabase.from('market_prices').select('commodity, price_ngn_per_kg, market_location, recorded_at')
      .order('recorded_at', { ascending: false }).limit(5),
  ])

  const aggregator = aggRes.data
  const batches = batchRes.data ?? []
  const totalBatches = batchRes.count ?? 0
  const totalFarmers = farmerRes.count ?? 0
  const latestPrices = priceRes.data ?? []

  const totalKg = batches.reduce((s, b) => s + (b.quantity_kg ?? 0), 0)
  const tierLimit = TIER_LIMITS[aggregator?.subscription_tier as SubscriptionTier ?? 'trial']
  const usagePercent = Math.min(100, Math.round(((aggregator?.monthly_batch_count ?? 0) / tierLimit) * 100))

  const recentBatches = batches.slice(0, 5)

  const statusCounts = batches.reduce((acc, b) => {
    acc[b.status as BatchStatus] = (acc[b.status as BatchStatus] ?? 0) + 1
    return acc
  }, {} as Record<BatchStatus, number>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {aggregator?.company_name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {aggregator?.subscription_tier?.toUpperCase()} plan · {aggregator?.monthly_batch_count}/{tierLimit === Infinity ? '∞' : tierLimit} batches this month
        </p>
      </div>

      {/* Usage bar */}
      {tierLimit !== Infinity && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="font-medium text-gray-700">Monthly batch usage</span>
            <span className={usagePercent >= 90 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
              {aggregator?.monthly_batch_count} / {tierLimit}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-400' : 'bg-[#7ec850]'}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          {usagePercent >= 80 && (
            <p className="text-xs text-amber-700 mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Approaching limit — <Link href="/settings" className="underline">upgrade your plan</Link>
            </p>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Batches" value={totalBatches} icon={Package} subtitle="All time" />
        <StatsCard title="Total Volume" value={formatKg(totalKg)} icon={Wheat} subtitle="Across all batches" iconColor="text-green-700" />
        <StatsCard title="Registered Farmers" value={totalFarmers} icon={Users} subtitle="In your network" iconColor="text-blue-700" />
        <StatsCard title="In Transit" value={statusCounts.in_transit ?? 0} icon={TrendingUp} subtitle="Active batches" iconColor="text-purple-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent batches */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Batches</h2>
            <Link href="/batches" className="text-xs text-[#1a4d1a] hover:underline font-medium">View all →</Link>
          </div>
          <div className="space-y-2">
            {recentBatches.length === 0 && <p className="text-sm text-gray-400">No batches yet. Start from WhatsApp or <Link href="/batches" className="underline text-[#1a4d1a]">add manually</Link>.</p>}
            {recentBatches.map((b) => (
              <Link key={b.id} href={`/batches/${b.id}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800 capitalize">{b.crop_type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-400">{formatKg(b.quantity_kg)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(b.status as BatchStatus)}`}>
                  {statusLabel(b.status as BatchStatus)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Live market prices */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Market Prices</h2>
            <Link href="/market" className="text-xs text-[#1a4d1a] hover:underline font-medium">View all →</Link>
          </div>
          <div className="space-y-2">
            {latestPrices.length === 0 && <p className="text-sm text-gray-400">No price data yet.</p>}
            {latestPrices.map((p) => (
              <div key={p.recorded_at + p.commodity} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-800 capitalize">{p.commodity.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-400">{p.market_location}</p>
                </div>
                <p className="text-sm font-bold text-[#1a4d1a]">{formatNGN(p.price_ngn_per_kg)}<span className="text-xs font-normal text-gray-400">/kg</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/batches" className="px-4 py-2 bg-[#1a4d1a] text-white text-sm rounded-lg font-medium hover:bg-[#1a3d1a] transition-colors flex items-center gap-2">
            <Package className="w-4 h-4" /> Log New Batch
          </Link>
          <Link href="/documents/generate" className="px-4 py-2 border border-[#1a4d1a] text-[#1a4d1a] text-sm rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" /> Generate Document
          </Link>
          <Link href="/farmers" className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Users className="w-4 h-4" /> View Farmers
          </Link>
        </div>
      </div>
    </div>
  )
}
