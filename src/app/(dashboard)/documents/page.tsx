import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, Download, Plus } from 'lucide-react'
import type { DocType } from '@/types'

const DOC_LABELS: Record<DocType, string> = {
  certificate_of_origin: 'Certificate of Origin',
  phytosanitary: 'Phytosanitary Package',
  aflatoxin_compliance: 'Aflatoxin Compliance Log',
  batch_manifest: 'Batch Manifest',
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-600',
  generated: 'bg-blue-100 text-blue-700',
  submitted: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
}

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: docs } = await supabase
    .from('export_documents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export Documents</h1>
          <p className="text-sm text-gray-500 mt-0.5">Auto-generated compliance documents for export</p>
        </div>
        <Link
          href="/documents/generate"
          className="flex items-center gap-2 px-4 py-2 bg-[#1a4d1a] text-white text-sm rounded-lg font-medium hover:bg-[#1a3d1a] transition-colors"
        >
          <Plus className="w-4 h-4" /> Generate Document
        </Link>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        ⚠ Documents generated here are <strong>traceability records</strong> that must be countersigned by NEPC/SON before use in official export submissions.
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {!docs?.length ? (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No documents generated yet.</p>
            <Link href="/documents/generate" className="text-[#1a4d1a] text-sm underline mt-2 block">Generate your first document →</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {docs.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <FileText className="w-4 h-4 text-[#1a4d1a]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{DOC_LABELS[doc.doc_type as DocType]}</p>
                    <p className="text-xs text-gray-400">
                      {doc.batch_ids?.length ?? 0} batch{(doc.batch_ids?.length ?? 0) !== 1 ? 'es' : ''}
                      {doc.buyer_name ? ` · ${doc.buyer_name}` : ''}
                      {doc.destination_country ? ` → ${doc.destination_country}` : ''}
                    </p>
                    <p className="text-xs text-gray-300 mt-0.5">{new Date(doc.created_at).toLocaleString('en-NG')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[doc.status as keyof typeof STATUS_COLORS]}`}>
                    {doc.status}
                  </span>
                  {doc.generated_pdf_path && (
                    <a
                      href={`/api/documents/${doc.id}/download`}
                      className="p-1.5 text-gray-400 hover:text-[#1a4d1a] transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
