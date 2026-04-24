import Link from 'next/link'
import {
  Sprout, MessageCircle, BarChart3, FileCheck, ArrowRight,
  CheckCircle, Shield, Globe, Zap, Star, ChevronRight,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white">
      {/* Nav — sticky, backdrop blur keeps it readable on scroll */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 py-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a4d1a] rounded-lg">
            <div className="w-8 h-8 bg-[#1a4d1a] rounded-lg flex items-center justify-center flex-shrink-0">
              <Sprout className="w-4.5 h-4.5 text-[#7ec850]" aria-hidden="true" />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">AgriTrace</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#trust" className="hover:text-gray-900 transition-colors">Compliance</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors min-h-[44px]"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#1a4d1a] text-white text-sm font-semibold rounded-lg hover:bg-[#2d6b2d] active:bg-[#153d15] transition-colors min-h-[44px] shadow-sm"
            >
              Start Free <span className="hidden sm:inline">Trial</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — mobile-first, generous vertical rhythm */}
      <section className="relative overflow-hidden bg-white">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(126,200,80,0.08),transparent)]" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-[#f4faf0] border border-[#c6e8a0] text-[#1a4d1a] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 bg-[#7ec850] rounded-full animate-pulse" aria-hidden="true" />
            Katsina · Kano · Zamfara — Northwest Nigeria
          </div>

          {/* H1 — max 65 chars/line, fluid sizing */}
          <h1 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-extrabold text-gray-900 leading-[1.15] tracking-tight max-w-3xl mx-auto">
            From farmgate to export —
            <span className="text-[#1a4d1a]"> fully traceable.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
            AgriTrace digitises Nigeria&apos;s agricultural supply chain. WhatsApp-native farmer onboarding,
            AI market intelligence in Hausa &amp; English, and automated export compliance documentation.
          </p>

          {/* CTAs — stacked on mobile, row on sm+ */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1a4d1a] text-white text-sm font-semibold rounded-xl hover:bg-[#2d6b2d] active:bg-[#153d15] transition-colors shadow-md shadow-green-900/20 min-h-[48px]"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/verify/KAT-SES-DEMO-0001"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[48px]"
            >
              See batch verification
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Social proof micro-text */}
          <p className="mt-5 text-xs text-gray-400">
            10 batches free · No credit card required · Works on any smartphone
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#1a2e1a]" aria-label="Market statistics">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-6 text-center">
          {[
            { value: '4.2M+', label: 'Addressable Farmers' },
            { value: '₦2.1T+', label: 'Target Market p/a' },
            { value: '12,000+', label: 'Aggregators NW Nigeria' },
            { value: '70%', label: 'Supply Chain Untracked' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#7ec850] tabular-nums">{s.value}</p>
              <p className="text-xs sm:text-sm text-white/60 mt-1.5 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust bar — compliance signals for international buyers */}
      <section id="trust" className="border-b border-gray-100 bg-[#f4faf0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Compliance Ready</span>
            {[
              { Icon: Shield, label: 'EUDR Traceability' },
              { Icon: FileCheck, label: 'NEPC Documentation' },
              { Icon: Globe, label: 'EU / GCC / Morocco' },
              { Icon: Zap, label: 'Real-time QR Verify' },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                <Icon className="w-3.5 h-3.5 text-[#1a4d1a]" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Three layers. One platform.</h2>
          <p className="mt-3 text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            Purpose-built for Nigerian commodity aggregators and the farmers they work with.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              Icon: MessageCircle,
              tag: 'For Farmers',
              title: 'WhatsApp Farmer Interface',
              desc: 'Farmers register and log harvest batches via WhatsApp in Hausa or English — no app download required. Every batch gets a QR-coded digital certificate.',
              points: ['Hausa + English support', 'QR batch certificates', 'Daily fair-price alerts'],
            },
            {
              Icon: FileCheck,
              tag: 'For Aggregators',
              title: 'Aggregator SaaS Dashboard',
              desc: 'Manage batch inventories, issue digital receipts to farmers, and auto-generate export compliance documents in minutes — not weeks.',
              points: ['Inventory management', 'Export document automation', 'Digital farmer receipts'],
            },
            {
              Icon: BarChart3,
              tag: 'AI-Powered',
              title: 'Market Intelligence Engine',
              desc: 'Gemini AI aggregates real-time prices from Kano, Lagos, Abuja, and international markets, pushing fair-price alerts to farmers every morning.',
              points: ['Real-time price data', 'Morocco / UAE / EU markets', 'Predictive pricing model'],
            },
          ].map((f) => (
            <article key={f.title} className="relative border border-gray-100 rounded-2xl p-6 bg-white hover:border-[#c6e8a0] hover:shadow-sm transition-all duration-200">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#1a4d1a] bg-[#f4faf0] px-2.5 py-1 rounded-full uppercase tracking-wide mb-4">
                {f.tag}
              </div>
              <div className="w-10 h-10 bg-[#f4faf0] rounded-xl flex items-center justify-center mb-3">
                <f.Icon className="w-5 h-5 text-[#1a4d1a]" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-gray-900 text-base mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{f.desc}</p>
              <ul className="space-y-2" role="list">
                {f.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-3.5 h-3.5 text-[#7ec850] flex-shrink-0 mt-0.5" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* How it works — simple 3-step flow */}
      <section className="bg-[#f4faf0] py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">How AgriTrace works</h2>
          <p className="text-gray-500 text-sm sm:text-base mb-12">From registration to certified export lot in three steps.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Farmer registers on WhatsApp', desc: 'Sends "REGISTER" to the AgriTrace WhatsApp number. Logs harvests in Hausa or English. Receives QR-coded batch certificate.' },
              { step: '02', title: 'Aggregator tracks the lot', desc: 'Dashboard shows every batch — origin, quantity, quality grade, and chain-of-custody events in real time.' },
              { step: '03', title: 'Export document in minutes', desc: 'Select batches, choose document type (COO, Phytosanitary, Aflatoxin Log), download PDF instantly.' },
            ].map((s, i) => (
              <div key={s.step} className="relative text-left">
                {i < 2 && (
                  <div className="hidden sm:block absolute top-5 left-full w-full h-px border-t border-dashed border-[#c6e8a0] -translate-x-4" aria-hidden="true" />
                )}
                <div className="w-10 h-10 bg-[#1a4d1a] text-[#7ec850] rounded-xl flex items-center justify-center text-sm font-bold mb-4 tabular-nums">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials / Social proof */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Built on deep local knowledge</h2>
          <p className="mt-3 text-gray-500 text-sm max-w-xl mx-auto">Validated through first-hand fieldwork and international trade engagement.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              quote: "Morocco's commodity importers confirmed strong demand for certified, traceable Nigerian agricultural lots — and the complete absence of reliable sourcing infrastructure.",
              author: "Huzaifa Yakubu Musa",
              role: "Founder — GITEX Africa 2026, Marrakech",
              stars: 5,
            },
            {
              quote: "Nigeria is Africa's largest sesame producer with 500,000+ MT annually from the Northwest zone. AgriTrace creates the digital infrastructure to capture this value.",
              author: "MBA Research Thesis",
              role: "Trans-Saharan Agricultural Trade Corridors — Lead City University",
              stars: 5,
            },
          ].map((t) => (
            <blockquote key={t.author} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex gap-0.5 mb-3" aria-label={`${t.stars} stars`}>
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#7ec850] text-[#7ec850]" aria-hidden="true" />
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <footer>
                <p className="text-sm font-semibold text-gray-900">{t.author}</p>
                <p className="text-xs text-gray-400">{t.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
            <p className="mt-3 text-gray-500 text-sm">Designed for Nigeria&apos;s commodity aggregators. No hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
            {[
              {
                tier: 'Starter', price: '₦15,000', period: '/month', batches: '50 batches / month',
                features: ['WhatsApp bot access', 'Batch QR generation', 'Basic export docs', 'Market price alerts', 'Email support'],
                highlight: false, cta: 'Start with Starter',
              },
              {
                tier: 'Growth', price: '₦35,000', period: '/month', batches: '250 batches / month',
                features: ['Everything in Starter', 'Advanced export docs', 'Buyer connection requests', 'Priority support', 'Team access'],
                highlight: true, cta: 'Start with Growth',
              },
              {
                tier: 'Enterprise', price: '₦75,000', period: '/month', batches: 'Unlimited batches',
                features: ['Everything in Growth', 'Full API access', 'Custom integrations', 'Dedicated onboarding', 'Data API access'],
                highlight: false, cta: 'Contact us',
              },
            ].map((plan) => (
              <div
                key={plan.tier}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.highlight
                    ? 'bg-[#1a4d1a] text-white shadow-xl shadow-green-900/25 ring-1 ring-[#2d6b2d]'
                    : 'bg-white border border-gray-100 shadow-sm'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#7ec850] text-[#1a2e1a] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                      Most popular
                    </span>
                  </div>
                )}
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${plan.highlight ? 'text-[#7ec850]' : 'text-gray-400'}`}>
                    {plan.tier}
                  </p>
                  <p className={`text-3xl font-extrabold tabular-nums ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                    <span className={`text-sm font-normal ml-0.5 ${plan.highlight ? 'text-white/60' : 'text-gray-400'}`}>{plan.period}</span>
                  </p>
                  <p className={`text-xs mt-1.5 mb-6 ${plan.highlight ? 'text-white/60' : 'text-gray-400'}`}>{plan.batches}</p>
                  <ul className="space-y-2.5 mb-8" role="list">
                    {plan.features.map((feature) => (
                      <li key={feature} className={`flex items-start gap-2 text-sm ${plan.highlight ? 'text-white/85' : 'text-gray-600'}`}>
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-[#7ec850]' : 'text-[#1a4d1a]'}`} aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/register"
                  className={`mt-auto block text-center py-3 rounded-xl text-sm font-semibold transition-colors min-h-[48px] flex items-center justify-center ${
                    plan.highlight
                      ? 'bg-[#7ec850] text-[#1a2e1a] hover:bg-[#8fd660] active:bg-[#6db843]'
                      : 'border-2 border-[#1a4d1a] text-[#1a4d1a] hover:bg-[#f4faf0] active:bg-[#e8f5e0]'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            All plans start with a 10-batch free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-[#1a2e1a] py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to digitise your supply chain?
          </h2>
          <p className="text-white/60 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Join commodity aggregators across Katsina, Kano, and Zamfara who are building
            traceable, export-ready commodity lots with AgriTrace.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#7ec850] text-[#1a2e1a] font-bold rounded-xl text-sm hover:bg-[#8fd660] active:bg-[#6db843] transition-colors shadow-lg shadow-black/30 min-h-[52px]"
          >
            Create your free account
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#1a4d1a] rounded-lg flex items-center justify-center">
                <Sprout className="w-3.5 h-3.5 text-[#7ec850]" aria-hidden="true" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-gray-700">AgriTrace</span>
                <span className="text-gray-300">·</span>
                <span>Katsina State, Nigeria</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span>© 2026 AgriTrace. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
