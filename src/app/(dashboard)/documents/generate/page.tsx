'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2 } from 'lucide-react'
import type { DocType, HarvestBatch } from '@/types'
import { cropLabel, formatKg } from '@/lib/utils'

const DOC_TYPES: { value: DocType; label: string; desc: string }[] = [
  { value: 'certificate_of_origin', label: 'Certificate of Origin', desc: 'Required for international exports. Certifies commodity source.' },
  { value: 'batch_manifest', label: 'Batch Manifest', desc: 'Full inventory record of all commodity lots in this shipment.' },
  { value: 'aflatoxin_compliance', label: 'Aflatoxin Compliance Log', desc: 'Aflatoxin testing evidence package for EU/GCC market access.' },
  { value: 'phytosanitary', label: 'Phytosanitary Package', desc: 'Application package for government phytosanitary certificate.' },
]

export default function GenerateDocumentPage() {
  const router = useRouter()
  const [batches, setBatches] = useState<HarvestBatch[]>([])
  const [selectedBatches, setSelectedBatches] = useState<string[]>([])
  const [docType, setDocType] = useState<DocType>('batch_manifest')
  const [buyerName, setBuyerName] = useState('')
  const [destinationCountry, setDestinationCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingBatches, setFetchingBatches] = useState(true)

  useEffect(() => {
    fetch('/api/batches?limit=100')
      .then((r) => r.json())
      .then((d) => setBatches(d.batches ?? []))
      .finally(() => setFetchingBatches(false))
  }, [])

  function toggleBatch(id: string) {
    setSelectedBatches((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    )
  }

  async function handleGenerate() {
    if (!selectedBatches.length) return
    setLoading(true)
    try {
      const res = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_ids: selectedBatches, doc_type: docType, buyer_name: buyerName, destination_country: destinationCountry }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `agritrace-${docType}.pdf`
      a.click()
      router.push('/documents')
    } catch (e) {
      alert('Document generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/documents" className="text-xs text-gray-400 hover:text-[#1a4d1a]">← Back to Documents</a>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Generate Export Document</h1>
      </div>

      {/* Document type */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-3">
        <h2 className="font-semibold text-gray-900">1. Document Type</h2>
        <div className="grid grid-cols-1 gap-2">
          {DOC_TYPES.map((dt) => (
            <label key={dt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${docType === dt.value ? 'border-[#1a4d1a] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="docType" value={dt.value} checked={docType === dt.value} onChange={() => setDocType(dt.value)} className="mt-0.5 accent-[#1a4d1a]" />
              <div>
                <p className="text-sm font-medium text-gray-800">{dt.label}</p>
                <p className="text-xs text-gray-400">{dt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Batch selection */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-3">
        <h2 className="font-semibold text-gray-900">2. Select Batches</h2>
        {fetchingBatches ? (
          <p className="text-sm text-gray-400">Loading batches...</p>
        ) : batches.length === 0 ? (
          <p className="text-sm text-gray-400">No batches available.</p>
        ) : (
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {batches.map((b) => (
              <label key={b.id} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${selectedBatches.includes(b.id) ? 'border-[#1a4d1a] bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <input type="checkbox" checked={selectedBatches.includes(b.id)} onChange={() => toggleBatch(b.id)} className="accent-[#1a4d1a]" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-semibold text-[#1a4d1a]">{b.batch_ref}</p>
                  <p className="text-xs text-gray-500">{cropLabel(b.crop_type)} · {formatKg(b.quantity_kg)}</p>
                </div>
                <span className="text-xs text-gray-400">{b.harvest_date}</span>
              </label>
            ))}
          </div>
        )}
        {selectedBatches.length > 0 && (
          <p className="text-xs text-[#1a4d1a] font-medium">{selectedBatches.length} batch{selectedBatches.length !== 1 ? 'es' : ''} selected</p>
        )}
      </div>

      {/* Buyer info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
        <h2 className="font-semibold text-gray-900">3. Buyer Details (Optional)</h2>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Buyer Name</label>
          <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]" placeholder="e.g. Atlas Trading Morocco" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Destination Country</label>
          <input value={destinationCountry} onChange={(e) => setDestinationCountry(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d1a]" placeholder="e.g. Morocco, UAE, Netherlands" />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || selectedBatches.length === 0}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#1a4d1a] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3d1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        {loading ? 'Generating PDF...' : 'Generate & Download PDF'}
      </button>
    </div>
  )
}
