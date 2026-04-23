import Link from 'next/link'
import { Sprout, MessageCircle, BarChart3, FileCheck, ArrowRight, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="w-6 h-6 text-[#1a4d1a]" />
            <span className="font-bold text-lg text-gray-900">AgriTrace</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900">Sign in</Link>
            <Link href="/register" className="px-4 py-2 bg-[#1a4d1a] text-white text-sm rounded-lg font-medium hover:bg-[#1a3d1a] transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 text-[#1a4d1a] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-[#7ec850] rounded-full"></span>
          Nigeria&apos;s Northwest Agricultural Belt
        </div>
        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight max-w-3xl mx-auto">
          From farmgate to export —<br />
          <span className="text-[#1a4d1a]">fully traceable.</span>
        </h1>
        <p className="text-lg text-gray-500 mt-5 max-w-2xl mx-auto">
          AgriTrace digitises Nigeria&apos;s agricultural supply chain with AI-powered market intelligence,
          WhatsApp-native farmer onboarding, and automated export compliance documentation.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link href="/register" className="flex items-center gap-2 px-6 py-3 bg-[#1a4d1a] text-white rounded-lg font-semibold hover:bg-[#1a3d1a] transition-colors">
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/verify/KAT-SES-DEMO-0001" className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            See Verification
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#1a2e1a] text-white py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { value: '4.2M+', label: 'Addressable Farmers' },
            { value: '₦2.1T+', label: 'Target Market (p/a)' },
            { value: '12,000+', label: 'Aggregators NW Nigeria' },
            { value: '70%', label: 'Supply Chain Untracked' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold text-[#7ec850]">{s.value}</p>
              <p className="text-sm text-white/60 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Three layers. One platform.</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            {
              Icon: MessageCircle,
              title: 'WhatsApp Farmer Interface',
              desc: 'Farmers register and log harvest batches via WhatsApp in Hausa or English — no app download required. Every batch gets a QR-coded digital certificate.',
              points: ['Hausa + English support', 'QR batch certificates', 'Daily price alerts'],
            },
            {
              Icon: FileCheck,
              title: 'Aggregator SaaS Dashboard',
              desc: 'Commodity aggregators and exporters manage inventory, issue digital receipts to farmers, and auto-generate export compliance documents in minutes instead of weeks.',
              points: ['Inventory management', 'Export document automation', 'Digital farmer receipts'],
            },
            {
              Icon: BarChart3,
              title: 'AI Market Intelligence',
              desc: 'Gemini-powered price intelligence aggregates real-time data from Kano, Lagos, Abuja, and international markets, pushing fair-price alerts to farmers every morning.',
              points: ['Real-time price data', 'International markets', 'Predictive pricing'],
            },
          ].map((f) => (
            <div key={f.title} className="border border-gray-100 rounded-xl p-6">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                <f.Icon className="w-5 h-5 text-[#1a4d1a]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{f.desc}</p>
              <ul className="space-y-1.5">
                {f.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 text-[#7ec850] flex-shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">Simple, fair pricing</h2>
          <p className="text-center text-gray-500 mb-10">Designed for Nigeria&apos;s commodity aggregators</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                tier: 'Starter', price: '₦15,000', period: '/month', batches: '50 batches/month',
                features: ['WhatsApp bot access', 'Batch QR generation', 'Basic export docs', 'Market price alerts'],
                highlight: false,
              },
              {
                tier: 'Growth', price: '₦35,000', period: '/month', batches: '250 batches/month',
                features: ['Everything in Starter', 'Advanced export docs', 'Buyer connections', 'Priority support'],
                highlight: true,
              },
              {
                tier: 'Enterprise', price: '₦75,000', period: '/month', batches: 'Unlimited batches',
                features: ['Everything in Growth', 'API access', 'Custom integrations', 'Dedicated onboarding'],
                highlight: false,
              },
            ].map((p) => (
              <div key={p.tier} className={`rounded-xl p-6 ${p.highlight ? 'bg-[#1a4d1a] text-white' : 'bg-white border border-gray-100'}`}>
                <p className={`font-semibold mb-1 text-sm uppercase tracking-wide ${p.highlight ? 'text-[#7ec850]' : 'text-gray-500'}`}>{p.tier}</p>
                <p className={`text-3xl font-bold ${p.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {p.price}<span className="text-sm font-normal opacity-60">{p.period}</span>
                </p>
                <p className={`text-xs mt-1 mb-5 ${p.highlight ? 'text-white/60' : 'text-gray-400'}`}>{p.batches}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${p.highlight ? 'text-white/80' : 'text-gray-600'}`}>
                      <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${p.highlight ? 'text-[#7ec850]' : 'text-[#1a4d1a]'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-2 rounded-lg text-sm font-semibold transition-colors ${p.highlight ? 'bg-[#7ec850] text-[#1a2e1a] hover:bg-[#6db843]' : 'border border-[#1a4d1a] text-[#1a4d1a] hover:bg-green-50'}`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-[#1a4d1a]" />
            <span className="font-medium text-gray-600">AgriTrace</span>
            <span>· Katsina, Nigeria</span>
          </div>
          <p>Built by Huzex Lab · Kirkira Innovation Hub</p>
        </div>
      </footer>
    </div>
  )
}
