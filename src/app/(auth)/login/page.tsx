'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sprout, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-dvh bg-[#f4faf0] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a4d1a] rounded-xl p-2 -m-2">
            <div className="w-14 h-14 bg-[#1a4d1a] rounded-2xl flex items-center justify-center shadow-lg shadow-green-900/20">
              <Sprout className="w-7 h-7 text-[#7ec850]" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-xl text-gray-900 tracking-tight">AgriTrace</p>
              <p className="text-sm text-gray-500 mt-0.5">Aggregator & Exporter Portal</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-7">
          <h1 className="text-lg font-bold text-gray-900 mb-5">Sign in to your account</h1>

          <form onSubmit={handleLogin} noValidate className="space-y-4">
            {/* Error — aria-live so screen readers announce it */}
            {error && (
              <div role="alert" aria-live="polite" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <span className="mt-0.5 text-red-500 flex-shrink-0">⚠</span>
                <span>{error}. Check your email and password and try again.</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent transition-shadow min-h-[48px]"
                placeholder="you@company.ng"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <a href="#" className="text-xs text-[#1a4d1a] hover:underline">Forgot password?</a>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a4d1a] focus:border-transparent transition-shadow min-h-[48px]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#1a4d1a] text-white rounded-xl text-sm font-semibold hover:bg-[#2d6b2d] active:bg-[#153d15] disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[52px] shadow-sm"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              <span>{loading ? 'Signing in…' : 'Sign In'}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          New to AgriTrace?{' '}
          <Link href="/register" className="text-[#1a4d1a] font-semibold hover:underline">
            Register your business →
          </Link>
        </p>
      </div>
    </div>
  )
}
