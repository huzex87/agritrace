import PDFDocument from 'pdfkit'
import { generateQRDataUrl } from '@/lib/qr/generator'
import type { HarvestBatch, TransferEvent, Aggregator, DocType } from '@/types'
import { cropLabel, formatNGN, formatKg } from '@/lib/utils'

interface DocumentInput {
  docType: DocType
  aggregator: Aggregator
  batches: HarvestBatch[]
  transfers: TransferEvent[]
  buyerName?: string
  destinationCountry?: string
}

export async function generateExportDocument(input: DocumentInput): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const chunks: Buffer[] = []
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const { docType, aggregator, batches, transfers, buyerName, destinationCountry } = input
    const totalQty = batches.reduce((sum, b) => sum + b.quantity_kg, 0)
    const issueDate = new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
    const docRef = `AGT-${docType.slice(0, 3).toUpperCase()}-${Date.now()}`

    // ── HEADER ──────────────────────────────
    doc.fillColor('#1a4d1a').fontSize(20).font('Helvetica-Bold').text('AgriTrace', 50, 50)
    doc.fillColor('#666').fontSize(9).font('Helvetica').text('AI-Powered Agricultural Supply Chain Traceability', 50, 75)
    doc.fillColor('#333').fontSize(11).text(`Document Reference: ${docRef}`, 50, 92)
    doc.fillColor('#333').fontSize(11).text(`Issued: ${issueDate}`, 50, 108)

    // Document type title
    const titles: Record<DocType, string> = {
      certificate_of_origin: 'CERTIFICATE OF ORIGIN',
      phytosanitary: 'PHYTOSANITARY COMPLIANCE PACKAGE',
      aflatoxin_compliance: 'AFLATOXIN COMPLIANCE LOG',
      batch_manifest: 'BATCH MANIFEST',
    }
    doc.moveTo(50, 130).lineTo(545, 130).strokeColor('#1a4d1a').lineWidth(2).stroke()
    doc.fillColor('#1a4d1a').fontSize(16).font('Helvetica-Bold').text(titles[docType], 50, 140, { align: 'center' })
    doc.moveTo(50, 165).lineTo(545, 165).strokeColor('#1a4d1a').lineWidth(1).stroke()

    // ── DISCLAIMER BANNER ────────────────────
    doc.fillColor('#cc4400').fontSize(8).font('Helvetica-Bold')
      .text('⚠ DRAFT — FOR TRACEABILITY EVIDENCE ONLY. Requires government countersignature before official submission.', 50, 172, { align: 'center' })

    // ── EXPORTER INFO ───────────────────────
    doc.fillColor('#1a4d1a').fontSize(11).font('Helvetica-Bold').text('Exporter / Aggregator', 50, 195)
    doc.fillColor('#333').fontSize(10).font('Helvetica')
      .text(`Company: ${aggregator.company_name}`, 50, 212)
      .text(`State: ${aggregator.state}${aggregator.lga ? ', ' + aggregator.lga : ''}`, 50, 226)
      .text(`NEPC Reg: ${aggregator.nepc_reg ?? 'Pending Registration'}`, 50, 240)

    if (buyerName || destinationCountry) {
      doc.fillColor('#1a4d1a').fontSize(11).font('Helvetica-Bold').text('Buyer / Destination', 310, 195)
      doc.fillColor('#333').fontSize(10).font('Helvetica')
      if (buyerName) doc.text(`Buyer: ${buyerName}`, 310, 212)
      if (destinationCountry) doc.text(`Country: ${destinationCountry}`, 310, 226)
    }

    // ── BATCH TABLE ─────────────────────────
    doc.fillColor('#1a4d1a').fontSize(11).font('Helvetica-Bold').text('Commodity Lots', 50, 270)
    const tableTop = 285
    const cols = [50, 150, 240, 320, 390, 460]
    const headers = ['Batch Ref', 'Crop', 'Quantity', 'Grade', 'Harvest Date', 'Origin']

    doc.fillColor('#1a4d1a').fontSize(9).font('Helvetica-Bold')
    headers.forEach((h, i) => doc.text(h, cols[i], tableTop))
    doc.moveTo(50, tableTop + 14).lineTo(545, tableTop + 14).strokeColor('#1a4d1a').lineWidth(0.5).stroke()

    doc.fillColor('#333').fontSize(8).font('Helvetica')
    batches.forEach((b, idx) => {
      const y = tableTop + 22 + idx * 16
      if (y > 680) return // simple overflow guard
      doc.text(b.batch_ref, cols[0], y)
        .text(cropLabel(b.crop_type), cols[1], y)
        .text(formatKg(b.quantity_kg), cols[2], y)
        .text(b.quality_grade ?? '—', cols[3], y)
        .text(b.harvest_date, cols[4], y)
        .text(b.farmer?.state ?? '—', cols[5], y)
    })

    const tableBottomY = tableTop + 22 + batches.length * 16 + 8
    doc.moveTo(50, tableBottomY).lineTo(545, tableBottomY).strokeColor('#ccc').lineWidth(0.5).stroke()
    doc.fillColor('#1a4d1a').fontSize(10).font('Helvetica-Bold')
      .text(`Total: ${formatKg(totalQty)}`, 50, tableBottomY + 6)

    // ── CHAIN OF CUSTODY SUMMARY ─────────────
    const custodyY = tableBottomY + 35
    doc.fillColor('#1a4d1a').fontSize(11).font('Helvetica-Bold').text('Chain of Custody', 50, custodyY)
    doc.fillColor('#333').fontSize(8).font('Helvetica')
    transfers.slice(0, 8).forEach((t, i) => {
      doc.text(
        `${i + 1}. ${t.handler_type.toUpperCase()} → ${t.to_party} | ${new Date(t.recorded_at).toLocaleDateString()} | via ${t.recorded_via}`,
        50, custodyY + 14 + i * 12
      )
    })

    // ── QR CODES ─────────────────────────────
    const qrY = custodyY + 14 + Math.min(transfers.length, 8) * 12 + 15
    if (qrY < 680 && batches.length > 0) {
      try {
        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${batches[0].batch_ref}`
        const qrDataUrl = await generateQRDataUrl(verifyUrl)
        const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '')
        doc.image(Buffer.from(qrBase64, 'base64'), 50, qrY, { width: 70 })
        doc.fillColor('#666').fontSize(7).text('Scan to verify traceability', 50, qrY + 73)
      } catch (_) { /* QR optional */ }
    }

    // ── FOOTER ──────────────────────────────
    doc.moveTo(50, 760).lineTo(545, 760).strokeColor('#1a4d1a').lineWidth(0.5).stroke()
    doc.fillColor('#999').fontSize(7).font('Helvetica')
      .text('Generated by AgriTrace Platform | agritrace.ng | This document is a traceability record and requires official countersignature for export submission.', 50, 766, { align: 'center' })
      .text(`Document Hash Anchor: ${docRef} | Generated: ${new Date().toISOString()}`, 50, 778, { align: 'center' })

    doc.end()
  })
}
