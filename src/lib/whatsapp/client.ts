const WA_BASE = 'https://graph.facebook.com/v19.0'
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!

interface TextPayload {
  messaging_product: 'whatsapp'
  to: string
  type: 'text'
  text: { body: string; preview_url?: boolean }
}

interface ImagePayload {
  messaging_product: 'whatsapp'
  to: string
  type: 'image'
  image: { link: string; caption?: string }
}

async function send(payload: TextPayload | ImagePayload) {
  const res = await fetch(`${WA_BASE}/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('[WhatsApp] send error:', err)
  }
  return res.ok
}

export async function sendText(to: string, body: string): Promise<boolean> {
  return send({ messaging_product: 'whatsapp', to, type: 'text', text: { body } })
}

export async function sendImage(to: string, imageUrl: string, caption?: string): Promise<boolean> {
  return send({
    messaging_product: 'whatsapp',
    to,
    type: 'image',
    image: { link: imageUrl, caption },
  })
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const crypto = require('crypto') as typeof import('crypto')
  const appSecret = process.env.WHATSAPP_APP_SECRET!
  const expected = crypto.createHmac('sha256', appSecret).update(body).digest('hex')
  return signature === `sha256=${expected}`
}
