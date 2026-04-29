import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmail } from '@/lib/gmail'

function genRef(): string {
  const d  = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const rnd = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `PMI-${d.getFullYear()}-${mm}${dd}-${rnd}`
}

export async function POST(req: NextRequest) {
  const { fullName, email, phone, license, expiry, brokerage, howHear, assocNames } = await req.json()
  if (!fullName?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
  }

  const refNumber = genRef()

  // Store in DB
  try {
    await supabaseAdmin.from('real_estate_agents').insert({
      full_name:     fullName.trim(),
      email:         email.trim(),
      phone:         phone?.trim() ?? null,
      license_number: license?.trim() ?? null,
      license_expiry: expiry || null,
      brokerage:     brokerage?.trim() ?? null,
      status:        'pending',
      notes:         `How heard: ${howHear ?? '—'}\nAssociations: ${assocNames ?? '—'}`,
    })
  } catch (e) {
    console.error('[register/agent] DB error:', e)
  }

  // Notify service team
  void sendEmail({
    to: 'service@topfloridaproperties.com',
    subject: `New Agent Registration — ${fullName} | Ref: ${refNumber}`,
    html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#f26a1b;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:18px">New Agent Registration</h1>
        <p style="color:rgba(255,255,255,.85);margin:6px 0 0;font-size:13px;font-family:monospace">Ref: ${refNumber}</p>
      </div>
      <div style="background:#111;padding:24px;color:#fff">
        <table style="width:100%;font-size:13px;border-collapse:collapse">
          <tr><td style="padding:7px 0;color:#9ca3af;width:45%">Name</td><td style="padding:7px 0">${fullName}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af">Email</td><td style="padding:7px 0">${email}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af">Phone</td><td style="padding:7px 0">${phone || '—'}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af">License</td><td style="padding:7px 0">${license || '—'} ${expiry ? `(exp. ${expiry})` : ''}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af">Brokerage</td><td style="padding:7px 0">${brokerage || '—'}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af">Associations</td><td style="padding:7px 0">${assocNames || '—'}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af">How heard</td><td style="padding:7px 0">${howHear || '—'}</td></tr>
        </table>
        <div style="text-align:center;margin-top:24px">
          <a href="https://maia.pmitop.com/admin/registrations" style="display:inline-block;background:#f26a1b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:3px;font-size:13px;font-weight:700;font-family:monospace;text-transform:uppercase">
            Review in Dashboard →
          </a>
        </div>
      </div>
      <div style="background:#0d0d0d;padding:14px;text-align:center"><p style="color:#555;font-size:11px;margin:0;font-family:monospace">Generated automatically by MAIA · PMI Top Florida Properties</p></div>
    </body></html>`,
  }).catch(() => {})

  // Confirmation to agent
  void sendEmail({
    to: email.trim(),
    subject: `Your PMI Top Florida Agent Registration — Ref: ${refNumber}`,
    html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
      <p style="color:#555">Hi ${fullName},</p>
      <p style="color:#555;line-height:1.6">Thank you for registering with PMI Top Florida Properties! We've received your application and our team will review it within 1 business day.</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:16px;margin:16px 0;text-align:center">
        <div style="font-size:11px;font-family:monospace;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Reference Number</div>
        <div style="font-size:20px;font-family:monospace;font-weight:700;color:#f26a1b">${refNumber}</div>
      </div>
      <p style="color:#9ca3af;font-size:12px">Questions? Contact us at <a href="mailto:service@topfloridaproperties.com" style="color:#f26a1b">service@topfloridaproperties.com</a> or <a href="tel:+13059005077" style="color:#f26a1b">305.900.5077</a></p>
    </body></html>`,
  }).catch(() => {})

  return NextResponse.json({ ok: true, refNumber })
}
