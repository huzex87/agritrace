# AgriTrace

**AI-Powered Agricultural Supply Chain Traceability & Market Intelligence Platform**

> Digitising Nigeria's agricultural supply chain — from farmgate to export — with AI-powered traceability and fair market intelligence.

Built for the Northwest Nigeria commodity belt (Katsina · Kano · Zamfara). Founded by Huzaifa Yakubu Musa (Huzex) at Kirkira Innovation Hub, Katsina State.

---

## Overview

AgriTrace is a WhatsApp-native SaaS platform that solves three interconnected problems in Nigeria's agricultural commodity sector:

1. **Invisible supply chain** — 70%+ of commodity movements have zero digital traceability, blocking access to premium export markets
2. **Smallholder exploitation** — farmers receive 30–50% below market rates due to no price data access
3. **Export documentation bottleneck** — compliance document collection takes weeks, locking SME exporters out of EU and GCC markets

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              CLIENT SURFACES                        │
│  [WhatsApp Bot]  [Aggregator Dashboard]  [Verify]   │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│              NEXT.JS API LAYER                      │
│  /api/whatsapp/webhook  /api/documents/generate     │
│  /api/batches           /api/market-prices          │
│  /api/cron/price-alerts /api/paystack/webhook       │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│              SUPABASE BACKEND                       │
│  PostgreSQL (RLS)  Auth  Storage  Edge Functions    │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
  WhatsApp Cloud API    Gemini 2.5 Flash-Lite
  Paystack              (Price intelligence)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + TypeScript + Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Messaging | WhatsApp Business Cloud API (Meta) |
| AI | Google Gemini 2.5 Flash-Lite |
| Payments | Paystack |
| PDF Generation | PDFKit |
| QR Codes | node-qrcode |
| Hosting | Vercel |

## Key Features

### WhatsApp Farmer Interface
- Farmer registration via conversational flow in **Hausa or English**
- Harvest batch logging → unique QR-coded digital certificate per batch
- Immutable chain-of-custody ledger (hash-chained transfer events)
- Daily AI-generated market price alerts pushed to all registered farmers

### Aggregator SaaS Dashboard
- Multi-tenant batch inventory management (Incoming / In-transit / Sold)
- Digital purchase receipt generation for farmers
- **Export document automation**: Certificate of Origin, Phytosanitary Package, Aflatoxin Compliance Log, Batch Manifest
- Subscription gating (Trial → Starter → Growth → Enterprise)

### AI Market Intelligence Engine
- Daily commodity price aggregation (Kano-Dawanau, Lagos-Mile12, Abuja, Onitsha)
- Gemini 2.5 Flash-Lite generates bilingual price alert messages
- Crowdsourced price submissions via WhatsApp from trusted market reporters

### Public Batch Verification
- Any buyer can scan a batch QR code to verify origin, custody chain, and traceability hash
- No authentication required — designed for international buyer trust

## Project Structure

```
agritrace/
├── src/
│   ├── app/
│   │   ├── (auth)/            # login, register
│   │   ├── (dashboard)/       # dashboard, batches, farmers, documents, market, receipts
│   │   ├── verify/[batchRef]  # public batch verification (no auth)
│   │   └── api/               # WhatsApp webhook, documents, market prices, cron
│   ├── components/
│   │   ├── dashboard/         # sidebar, stats-card
│   │   └── batch/             # custody-timeline
│   ├── lib/
│   │   ├── supabase/          # client, server, service clients
│   │   ├── whatsapp/          # FSM, client, message templates (Hausa/English)
│   │   ├── ai/                # Gemini client, price alerts
│   │   ├── documents/         # PDF generator (PDFKit)
│   │   └── qr/                # QR code generator
│   └── types/                 # shared TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # full DB schema with RLS policies
├── AGRITRACE_APPLICATION.md        # iDICE Startup Bridge application document
├── vercel.json                     # daily cron job config
└── .env.example                    # environment variable template
```

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (self-hosted on HOSTAFRICA recommended for Nigeria latency)
- A [Meta Developer](https://developers.facebook.com) account with WhatsApp Business Cloud API
- A [Google AI Studio](https://aistudio.google.com) API key
- A [Paystack](https://paystack.com) account

### Installation

```bash
git clone https://github.com/huzex87/agritrace.git
cd agritrace
npm install
cp .env.example .env.local
# Fill in .env.local with your credentials
npm run dev
```

### Database Setup

```bash
# Using Supabase CLI
supabase db push

# Or paste supabase/migrations/001_initial_schema.sql into the Supabase SQL editor
```

### Environment Variables

See [.env.example](.env.example) for all required variables.

### WhatsApp Bot Setup

1. Create a Meta App at developers.facebook.com
2. Add WhatsApp product and configure a Business Account
3. Set webhook URL: `https://your-domain.com/api/whatsapp/webhook`
4. Match `WHATSAPP_VERIFY_TOKEN` to your webhook config
5. **Start Meta Business Verification immediately** — unverified accounts cap at 250 conversations/day

### Cron Jobs

Daily price alerts run at 5:00 AM UTC (6:00 AM WAT) via Vercel Cron (configured in `vercel.json`).

## Subscription Tiers

| Tier | Price | Batches/month |
|------|-------|---------------|
| Trial | Free | 10 |
| Starter | ₦15,000/month | 50 |
| Growth | ₦35,000/month | 250 |
| Enterprise | ₦75,000/month | Unlimited |

## Important Notes

> **Gemini version:** This project uses `gemini-2.5-flash-lite`. The `gemini-2.0-flash` model is **deprecated June 1, 2026**.

> **Supabase hosting:** Self-host on [HOSTAFRICA](https://hostafrica.ng) for Nigeria latency (<30ms) and NDPA data residency compliance.

> **Export documents:** All PDFs require government countersignature (NEPC/SON) before official export use.

## Roadmap

**MVP (12 weeks — in progress):**
- [x] WhatsApp FSM (farmer registration + batch logging)
- [x] QR code generation + Supabase Storage
- [x] Aggregator dashboard (batches, farmers, receipts, documents)
- [x] Export document engine (PDFKit)
- [x] AI price alerts (Gemini 2.5 Flash-Lite)
- [x] Public batch verification page
- [ ] Paystack subscription integration
- [ ] WhatsApp Business API verification

**Phase 2:**
- [ ] Buyer marketplace with Paystack escrow
- [ ] GPS plot coordinates (EUDR compliance)
- [ ] Price scraping pipeline (Commodity.ng)
- [ ] B2G Data API for BOI/NEPC

## About

Built by **Huzaifa Yakubu Musa (Huzex)** at Kirkira Innovation Hub, Katsina State, Nigeria.

Developed as part of the **iDICE Startup Bridge Founders Lab 2026** application.
See [AGRITRACE_APPLICATION.md](AGRITRACE_APPLICATION.md) for the full application document.

---

*AgriTrace is an early-stage startup. This repository contains the MVP codebase under active development.*
