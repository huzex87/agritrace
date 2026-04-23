export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: aggregator } = await supabase
    .from('aggregators')
    .select('id, company_name, subscription_tier, subscription_status')
    .eq('user_id', user.id)
    .single()

  if (!aggregator) redirect('/register')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {aggregator.subscription_status === 'expired' && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-sm text-amber-800 flex items-center gap-2">
            <span>⚠</span>
            <span>Your subscription has expired. <a href="/settings" className="font-semibold underline">Renew now</a> to continue logging batches.</span>
          </div>
        )}
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
