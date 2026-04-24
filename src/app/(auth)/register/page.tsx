'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sprout, Loader2 } from 'lucide-react'
import { NW_STATES } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'account' | 'company'>('account')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [state, setState] = useState('')
  const [lga, setLga] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (step === 'account') { setStep('company'); return }

    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError || !user) { setError(signUpError?.message ?? 'Registration failed'); setLoading(false); return }

    const { error: aggError } = await supabase.from('aggregators').insert({
      user_id: user.id,
      company_name: companyName,
      state,
      lga,
      subscription_tier: 'trial',
    })
    if (aggError) { setError(aggError.message); setLoading(false); return }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#1a4d1a] rounded-xl mb-4">
            <Sprout className="w-6 h-6 text-[#7ec850]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Register on AgriTrace</h1>
          <p className="text-sm text-gray-500 mt-1">Start your 10-batch free trial today</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {['Account', 'Company'].map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 && step === 'account' ? 'bg-[#1a4d1a] text-white' : i === 1 && step === 'company' ? 'bg-[#1a4d1a] text-white' : i === 0 && step === 'company' ? 'bg-[#7ec850] text-[#1a2e1a]' : 'bg-gray-200 text-gray-400'}`}>
                {i === 0 && step === 'company' ? '✓' : i + 1}
              </div>
              <span className="text-xs text-gray-500">{s}</span>
              {i === 0 && <div className="flex-1 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleRegister} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div>
          )}

          {step === 'account' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                  placeholder="you@company.ng" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
                <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                  placeholder="Min. 8 characters" />
              </div>
            </>
          )}

          {step === 'company' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Company / Business Name</label>
                <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                  placeholder="e.g. Katsina Agro Traders Ltd" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                <select value={state} onChange={(e) => setState(e.target.value)} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]">
                  <option value="">Select state</option>
                  {NW_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Local Government Area</label>
                <input type="text" required value={lga} onChange={(e) => setLga(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]"
                  placeholder="e.g. Katsina LGA" />
              </div>
            </>
          )}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a4d1a] text-white rounded-lg text-sm font-semibold hover:bg-[#1a3d1a] disabled:opacity-60 transition-colors">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating account...' : step === 'account' ? 'Continue →' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already registered?{' '}
          <Link href="/login" className="text-[#1a4d1a] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
