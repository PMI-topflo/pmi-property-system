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
  const { company, contact, email, phone, service, license, assocNames, howHear } = await req.json()
  if (!company?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Company name and email are required.' }, { status: 400 })
  }

  const refNumber = genRef()

  try {
    await supabaseAdmin.from('vendors').insert({
      company_name:   company.trim(),
      contact_name:   contact?.trim() ?? null,
      email:          email.trim(),
      phone:          phone?.trim() ?? null,
      service_type:   service?.trim() ?? null,
      license_number: license?.trim() ?? null,
      status:         'pending',
      notes:          `How heard: ${howHear ?? '—'}\nAssociations: ${assocNames ?? '—'}`,
    })
  } catch (e) {
    console.error('[register/vendor] DB error:', e)
  }

  void sendEmail({
    to: 'billing@topfloridaproperties.com',
    subject: `New Vendor Registration — ${company} | Ref: ${refNumber}`,
    html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#f26a1b;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:18px">New Vendor Registration</h1>
        <p style="color:rgba(255,255,255,.85);margin:6px 0 0;font-size:13px;font-family:monospace">Ref: ${refNumber}</p>
      </div>
      <div style="background:#111;padding:24px;color:#fff">
        <table style="width:100%;font-size:13px;border-collapse:collapse">
          <tr><td style="padding:7px 0;color:#9ca3af;width:45%">Company</td><td style="padding:7px 0">${company}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af">Contact</td><td style="padding:7px 0">${contact || '—'}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af">Email</td><td style="padding:7px 0">${email}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af">Phone</td><td style="padding:7px 0">${phone || '—'}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af">Service Type</td><td style="padding:7px 0">${service || '—'}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af">License</td><td style="padding:7px 0">${license || '—'}</td></tr>
          <tr><td style="padding:7px 0;color:#9ca3af">Associations</td><td style="padding:7px 0">${assocNames || '—'}</td></tr>
        </table>
        <div style="text-align:center;margin-top:24px">
          <a href="https://maia.pmitop.com/admin/registrations" style="display:inline-block;background:#f26a1b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:3px;font-size:13px;font-weight:700;font-family:monospace;text-transform:uppercase">Review in Dashboard →</a>
        </div>
      </div>
      <div style="background:#0d0d0d;padding:14px;text-align:center"><p style="color:#555;font-size:11px;margin:0;font-family:monospace">Generated automatically by MAIA</p></div>
    </body></html>`,
  }).catch(() => {})

  void sendEmail({
    to: email.trim(),
    subject: `Your PMI Top Florida Vendor Registration — Ref: ${refNumber}`,
    html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
      <p style="color:#555">Hi ${contact || company},</p>
      <p style="color:#555;line-height:1.6">Thank you for registering with PMI Top Florida Properties! Our billing team will review your submission within 1 business day and send you ACH and COI instructions.</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:16px;margin:16px 0;text-align:center">
        <div style="font-size:11px;font-family:monospace;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Reference Number</div>
        <div style="font-size:20px;font-family:monospace;font-weight:700;color:#f26a1b">${refNumber}</div>
      </div>
      <p style="color:#9ca3af;font-size:12px">Questions? <a href="mailto:billing@topfloridaproperties.com" style="color:#f26a1b">billing@topfloridaproperties.com</a> · <a href="tel:+13059005077" style="color:#f26a1b">305.900.5077</a></p>
    </body></html>`,
  }).catch(() => {})

  return NextResponse.json({ ok: true, refNumber })
}
