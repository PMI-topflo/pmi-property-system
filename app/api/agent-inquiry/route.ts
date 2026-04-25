import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, email, phone, licenseNumber, association } = await req.json()

  if (!name || !email) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
  }

  const html = `
    <h2 style="color:#111;font-family:Arial,sans-serif">New Real Estate Agent Inquiry</h2>
    <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;width:100%;max-width:500px">
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600;width:140px">Name</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${name}</td></tr>
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${email}</td></tr>
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${phone || '—'}</td></tr>
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">License #</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${licenseNumber || '—'}</td></tr>
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Association</td><td style="padding:8px 12px">${association || '—'}</td></tr>
    </table>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#888;margin-top:16px">Submitted via MAIA homepage agent inquiry form.</p>
  `

  await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: 'maia@pmitop.com',
      subject: `[Agent Inquiry] ${name} — ${association || 'No association specified'}`,
      html,
    }),
  })

  return NextResponse.json({ ok: true })
}
