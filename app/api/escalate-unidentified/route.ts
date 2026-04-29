import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmail } from '@/lib/gmail'

function genRef(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const rnd = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `PMI-${d.getFullYear()}-${mm}${dd}-${rnd}`
}

export async function POST(req: NextRequest) {
  const {
    type, firstName, lastName, email, phone,
    address, unit, association, howHear, needHelp,
    messages, lang,
  } = await req.json()

  const refNumber = genRef()
  const fullName  = [firstName, lastName].filter(Boolean).join(' ')
  const ts        = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' })
  const addrLine  = [address, unit ? `Unit ${unit}` : ''].filter(Boolean).join(', ')

  const addToDbParams = new URLSearchParams({
    name: fullName, email: email ?? '', phone: phone ?? '',
    address: addrLine, association: association ?? '',
    ref: refNumber,
  })
  const addToDbUrl = `https://maia.pmitop.com/admin/homeowners/new?${addToDbParams}`

  const chatSection = type === 'chat' && (messages as Array<{ role: string; content: string }> | undefined)?.length
    ? `<div style="margin-top:24px">
        <h2 style="color:#f26a1b;font-size:12px;letter-spacing:.1em;text-transform:uppercase;margin:0 0 12px;font-family:monospace">Conversation Transcript</h2>
        <div style="background:#1a1a1a;border-radius:4px;padding:16px;font-size:12px;line-height:1.8;color:#d1d5db">
          ${(messages as Array<{ role: string; content: string }>).map(m =>
            `<div style="margin-bottom:10px"><strong style="color:${m.role === 'user' ? '#f26a1b' : '#9ca3af'}">${m.role === 'user' ? (fullName || 'Visitor') : 'MAIA'}:</strong> ${m.content}</div>`
          ).join('')}
        </div>
      </div>`
    : ''

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f5f5f5">
<div style="max-width:600px;margin:0 auto">
  <div style="background:#f26a1b;padding:28px 24px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700">⚠️ Unidentified Visitor — Action Required</h1>
    <p style="color:rgba(255,255,255,.88);margin:8px 0 0;font-size:13px;font-family:monospace">Ref: ${refNumber}</p>
  </div>
  <div style="background:#111;padding:28px;color:#fff">
    <h2 style="color:#f26a1b;font-size:11px;letter-spacing:.1em;text-transform:uppercase;margin:0 0 16px;font-family:monospace">Visitor Details</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr style="border-bottom:1px solid #222"><td style="padding:7px 0;color:#9ca3af;width:45%">Name</td><td style="padding:7px 0">${fullName || '—'}</td></tr>
      <tr style="border-bottom:1px solid #222"><td style="padding:7px 0;color:#9ca3af">Email</td><td style="padding:7px 0">${email || '—'}</td></tr>
      <tr style="border-bottom:1px solid #222"><td style="padding:7px 0;color:#9ca3af">Phone</td><td style="padding:7px 0">${phone || '—'}</td></tr>
      <tr style="border-bottom:1px solid #222"><td style="padding:7px 0;color:#9ca3af">Property</td><td style="padding:7px 0">${addrLine || '—'}</td></tr>
      <tr style="border-bottom:1px solid #222"><td style="padding:7px 0;color:#9ca3af">Association</td><td style="padding:7px 0">${association || '—'}</td></tr>
      <tr style="border-bottom:1px solid #222"><td style="padding:7px 0;color:#9ca3af">How they heard</td><td style="padding:7px 0">${howHear || '—'}</td></tr>
      <tr style="border-bottom:1px solid #222"><td style="padding:7px 0;color:#9ca3af">Needs help with</td><td style="padding:7px 0">${needHelp || '—'}</td></tr>
      <tr style="border-bottom:1px solid #222"><td style="padding:7px 0;color:#9ca3af">Language</td><td style="padding:7px 0">${lang || 'en'}</td></tr>
      <tr style="border-bottom:1px solid #222"><td style="padding:7px 0;color:#9ca3af">Contact type</td><td style="padding:7px 0">${type === 'chat' ? 'Web Chat' : 'Contact Form'}</td></tr>
      <tr><td style="padding:7px 0;color:#9ca3af">Timestamp</td><td style="padding:7px 0">${ts} ET</td></tr>
    </table>
    ${chatSection}
    <div style="text-align:center;margin-top:28px">
      <a href="${addToDbUrl}" style="display:inline-block;background:#f26a1b;color:#fff;text-decoration:none;padding:14px 32px;border-radius:3px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-family:monospace">
        Add to Database →
      </a>
    </div>
  </div>
  <div style="background:#0d0d0d;padding:16px;text-align:center">
    <p style="color:#555;font-size:11px;margin:0;font-family:monospace">Generated automatically by MAIA · PMI Top Florida Properties</p>
    <p style="color:#333;font-size:10px;margin:5px 0 0;font-family:monospace">${refNumber} · 3 failed identification attempts</p>
  </div>
</div>
</body></html>`

  // Send email (fire-and-forget — don't fail the request if email fails)
  void sendEmail({
    to: 'service@topfloridaproperties.com',
    subject: `⚠️ Unidentified Visitor — Action Required | Ref: ${refNumber}`,
    html,
  }).catch(() => { /* ignore */ })

  // Log to general_conversations
  try {
    await supabaseAdmin.from('general_conversations').insert({
      session_id:  refNumber,
      persona:     'homeowner',
      channel:     'web',
      status:      'unidentified',
      language:    lang ?? 'en',
      messages: [
        {
          role: 'system',
          content: JSON.stringify({
            type: 'escalation', refNumber, escalationType: type,
            firstName, lastName, email, phone, address, unit, association,
            howHear, needHelp,
            notes: 'Failed 3 identification attempts — escalated to team',
            timestamp: new Date().toISOString(),
          }),
        },
        ...(type === 'chat' && Array.isArray(messages) ? messages : []),
      ],
    })
  } catch { /* fire-and-forget */ }

  return NextResponse.json({ refNumber })
}
