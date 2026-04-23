import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/whatsapp/client'
import { handleMessage } from '@/lib/whatsapp/fsm'
import type { WhatsAppMessage, InboundMessage } from '@/types'

// Meta webhook verification handshake
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const mode = params.get('hub.mode')
  const token = params.get('hub.verify_token')
  const challenge = params.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature-256') ?? ''

  // Verify webhook authenticity
  if (!verifyWebhookSignature(rawBody, signature)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Must return 200 immediately; process async
  const payload: WhatsAppMessage = JSON.parse(rawBody)

  // Fire-and-forget: Meta retries if we return non-200
  processWebhook(payload).catch((err) => console.error('[Webhook] processing error:', err))

  return new NextResponse('OK', { status: 200 })
}

async function processWebhook(payload: WhatsAppMessage) {
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const messages: InboundMessage[] = change.value?.messages ?? []
      for (const msg of messages) {
        if (msg.type === 'text' && msg.text?.body) {
          await handleMessage(msg.from, msg.text.body)
        } else if (msg.type === 'interactive') {
          const reply = msg.interactive?.button_reply?.title ?? msg.interactive?.list_reply?.title ?? ''
          if (reply) await handleMessage(msg.from, reply)
        }
      }
    }
  }
}
