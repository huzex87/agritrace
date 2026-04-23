import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateExportDocument } from '@/lib/documents/pdf-generator'
import type { DocType } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { batch_ids, doc_type, buyer_name, destination_country } = await request.json() as {
    batch_ids: string[]
    doc_type: DocType
    buyer_name?: string
    destination_country?: string
  }

  if (!batch_ids?.length || !doc_type) {
    return NextResponse.json({ error: 'batch_ids and doc_type are required' }, { status: 400 })
  }

  const { data: aggregator } = await supabase
    .from('aggregators')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!aggregator) return NextResponse.json({ error: 'Aggregator not found' }, { status: 404 })

  // Fetch batches with farmer join
  const { data: batches } = await supabase
    .from('harvest_batches')
    .select('*, farmer:farmers(*)')
    .in('id', batch_ids)

  if (!batches?.length) return NextResponse.json({ error: 'Batches not found' }, { status: 404 })

  // Fetch all transfer events for these batches
  const { data: transfers } = await supabase
    .from('transfer_events')
    .select('*')
    .in('batch_id', batch_ids)
    .order('recorded_at', { ascending: true })

  // Create document record first
  const { data: docRecord } = await supabase
    .from('export_documents')
    .insert({ aggregator_id: aggregator.id, batch_ids, doc_type, buyer_name, destination_country })
    .select()
    .single()

  // Generate PDF
  const pdfBuffer = await generateExportDocument({
    docType: doc_type,
    aggregator,
    batches,
    transfers: transfers ?? [],
    buyerName: buyer_name,
    destinationCountry: destination_country,
  })

  // Upload to Storage
  const service = await createServiceClient()
  const pdfPath = `documents/${aggregator.id}/${docRecord!.id}.pdf`
  await service.storage.from('documents').upload(pdfPath, pdfBuffer, {
    contentType: 'application/pdf',
    upsert: true,
  })

  await supabase.from('export_documents')
    .update({ generated_pdf_path: pdfPath, status: 'generated' })
    .eq('id', docRecord!.id)

  // Return PDF inline for immediate download
  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="agritrace-${doc_type}-${docRecord!.id}.pdf"`,
    },
  })
}
