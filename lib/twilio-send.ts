import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function sendSMS(to: string, body: string): Promise<boolean> {
  try {
    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
      body,
    })
    return true
  } catch (err) {
    console.error('[SMS]', err)
    return false
  }
}

export async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  const waFrom = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER ?? process.env.TWILIO_PHONE_NUMBER}`
  const waTo   = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
  try {
    await client.messages.create({ from: waFrom, to: waTo, body })
    return true
  } catch (err) {
    console.error('[WhatsApp]', err)
    return false
  }
}
