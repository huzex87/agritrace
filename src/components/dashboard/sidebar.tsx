'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Package, Users, FileText, TrendingUp,
  Receipt, LogOut, Sprout, Settings,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/batches', label: 'Batches', icon: Package },
  { href: '/farmers', label: 'Farmers', icon: Users },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/market', label: 'Market Prices', icon: TrendingUp },
  { href: '/receipts', label: 'Receipts', icon: Receipt },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))

  return (
    <aside className="w-60 xl:w-64 bg-[#1a2e1a] text-white flex flex-col min-h-dvh flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-[#7ec850]/15 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sprout className="w-4.5 h-4.5 text-[#7ec850]" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[15px] leading-none tracking-tight truncate">AgriTrace</p>
          <p className="text-[11px] text-white/40 mt-1 truncate">Supply Chain Platform</p>
        </div>
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5" aria-label="Main navigation">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px]',
                active
                  ? 'bg-[#7ec850] text-[#1a2e1a] shadow-sm font-semibold'
                  : 'text-white/65 hover:bg-white/8 hover:text-white active:bg-white/12'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1a2e1a]/30 flex-shrink-0" aria-hidden="true" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer actions */}
      <div className="px-2.5 pb-4 pt-3 border-t border-white/10 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/8 hover:text-white transition-all duration-150 min-h-[44px]"
        >
          <Settings className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>Settings</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/8 hover:text-red-300 transition-all duration-150 min-h-[44px] cursor-pointer"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
