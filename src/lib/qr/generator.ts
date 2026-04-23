import QRCode from 'qrcode'

export async function generateBatchQR(
  batchRef: string,
  verifyUrl: string,
  supabase: { storage: { from: (bucket: string) => { upload: (path: string, data: Buffer, opts: object) => Promise<{ error: unknown }> } } }
): Promise<string | null> {
  // Generate QR as PNG buffer
  const qrBuffer: Buffer = await QRCode.toBuffer(verifyUrl, {
    type: 'png',
    width: 400,
    margin: 2,
    color: { dark: '#1a2e1a', light: '#ffffff' },
    errorCorrectionLevel: 'H',
  })

  const path = `batches/${batchRef}.png`
  const { error } = await supabase.storage.from('qrcodes').upload(path, qrBuffer, {
    contentType: 'image/png',
    upsert: true,
  })

  if (error) {
    console.error('[QR] upload error:', error)
    return null
  }

  return path
}

export async function generateQRDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 200,
    margin: 1,
    color: { dark: '#1a2e1a', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  })
}
