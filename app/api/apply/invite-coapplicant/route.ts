import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { primaryName, coApplicantName, coApplicantEmail, association, applicationId } = await req.json()

  if (!coApplicantEmail) {
    return NextResponse.json({ error: 'Co-applicant email required' }, { status: 400 })
  }

  const subject = `Joint Application — ${association}`
  const html = `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto;">
      <p>Hi ${coApplicantName || 'there'},</p>
      <p><strong>${primaryName || 'Your co-applicant'}</strong> has submitted a joint resident application for <strong>${association}</strong> and has listed you as a co-applicant or occupant.</p>
      <p>The application is now being processed. If you need to provide additional information or have questions, please reply to this email or contact us at <a href="mailto:support@topfloridaproperties.com">support@topfloridaproperties.com</a>.</p>
      ${applicationId ? `<p style="color:#6b7280;font-size:12px;">Reference: ${applicationId}</p>` : ''}
      <p style="color:#6b7280;font-size:12px;margin-top:24px;">PMI Top Florida Properties · pmitop.com</p>
    </div>
  `

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.pmitop.com'
    const res = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: coApplicantEmail, subject, html, persona: 'maia' }),
    })
    if (!res.ok) throw new Error('Email send failed')
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[invite-coapplicant]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
