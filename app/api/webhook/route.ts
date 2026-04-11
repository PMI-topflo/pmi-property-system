import { NextRequest, NextResponse } from 'next/server'

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const mode = url.searchParams.get('hub.mode')
  const token = url.searchParams.get('hub.verify_token')
  const challenge = url.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge || '', { status: 200 })
  }

  return new Response('Forbidden', { status: 403 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  console.log('FULL BODY:', JSON.stringify(body, null, 2))

  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]

  if (!message) {
    console.log('⚠️ No message found, ignoring event')
    return NextResponse.json({ status: 'ignored' })
  }

  const from = message.from
  const text = message.text?.body || ''

  console.log('From:', from)
  console.log('Text:', text)

  let replyText = 'Welcome to PMI Sticker System 🚗'

  if (text.toLowerCase() === 'hi') {
    replyText = `Welcome to PMI Sticker System 🚗

Choose an option:
1️⃣ Register Vehicle
2️⃣ Check Status
3️⃣ Contact Support`
  }

  await fetch(`https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: from,
      text: { body: replyText },
    }),
  })

  return NextResponse.json({ status: 'replied' })
}