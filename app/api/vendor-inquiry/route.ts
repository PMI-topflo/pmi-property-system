import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { companyName, contactName, email, phone, association } = await req.json()

  if (!companyName || !email) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
  }

  const base = process.env.NEXT_PUBLIC_APP_URL

  // Email to vendor
  const vendorHtml = `
    <div style="font-family:Arial,sans-serif;max-width:560px">
      <h2 style="color:#111">Welcome to PMI Top Florida Properties</h2>
      <p>Thank you for your inquiry, <strong>${contactName || companyName}</strong>. To set up vendor payments and get started working with us, please complete the following:</p>
      <h3 style="color:#f97316;font-size:15px;margin-top:24px">📄 Required Forms</h3>
      <ul style="line-height:1.8">
        <li><strong>Vendor ACH Form</strong> — for electronic payment setup. Download from your association's portal page or email billing@topfloridaproperties.com.</li>
        <li><strong>Certificate of Insurance (COI)</strong> — required before any work begins. Send to service@topfloridaproperties.com.</li>
      </ul>
      <h3 style="color:#f97316;font-size:15px;margin-top:24px">📬 Contact</h3>
      <ul style="line-height:1.8">
        <li>Billing &amp; ACH: <a href="mailto:billing@topfloridaproperties.com">billing@topfloridaproperties.com</a></li>
        <li>Service Coordination: <a href="mailto:service@topfloridaproperties.com">service@topfloridaproperties.com</a></li>
        <li>Phone: (305) 900-5077</li>
      </ul>
      ${association ? `<p><strong>Association:</strong> ${association}</p>` : ''}
      <p style="color:#888;font-size:12px;margin-top:24px">PMI Top Florida Properties · 305.900.5077 · PMI@topfloridaproperties.com</p>
    </div>
  `

  // Internal notification
  const internalHtml = `
    <h2 style="color:#111;font-family:Arial,sans-serif">New Vendor Inquiry</h2>
    <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;width:100%;max-width:500px">
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600;width:140px">Company</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${companyName}</td></tr>
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Contact</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${contactName || '—'}</td></tr>
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Email</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${email}</td></tr>
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Phone</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${phone || '—'}</td></tr>
      <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Association</td><td style="padding:8px 12px">${association || '—'}</td></tr>
    </table>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#888;margin-top:16px">Submitted via MAIA homepage vendor inquiry form.</p>
  `

  await Promise.all([
    fetch(`${base}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: `Welcome to PMI Top Florida Properties — Next Steps for ${companyName}`,
        html: vendorHtml,
      }),
    }),
    fetch(`${base}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'maia@pmitop.com',
        subject: `[Vendor Inquiry] ${companyName} — ${association || 'No association'}`,
        html: internalHtml,
      }),
    }),
  ])

  return NextResponse.json({ ok: true })
}
