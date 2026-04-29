import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmail } from '@/lib/gmail'

export async function POST(req: NextRequest) {
  const { type, id, status } = await req.json()
  if (!type || !id || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const table = type === 'agent' ? 'real_estate_agents' : 'vendors'

  const { data, error } = await supabaseAdmin
    .from(table)
    .update({ status, approved_at: status === 'active' ? new Date().toISOString() : null })
    .eq('id', id)
    .select('email, full_name, company_name')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Send notification email
  const recipientEmail = data?.email
  const recipientName  = data?.full_name ?? data?.company_name ?? 'Registrant'

  if (recipientEmail && status !== 'pending') {
    const isApproved = status === 'active'
    void sendEmail({
      to: recipientEmail,
      subject: `Your PMI Top Florida Registration — ${isApproved ? 'Approved ✅' : 'Update'}`,
      html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <p style="color:#555">Hi ${recipientName},</p>
        <p style="color:#555;line-height:1.6">
          ${isApproved
            ? `We're pleased to inform you that your registration with PMI Top Florida Properties has been <strong style="color:#22c55e">approved</strong>! You can now access our network and receive work orders.`
            : `Thank you for your interest in working with PMI Top Florida Properties. Unfortunately, we are unable to proceed with your registration at this time.`
          }
        </p>
        <p style="color:#9ca3af;font-size:12px">Questions? <a href="mailto:service@topfloridaproperties.com" style="color:#f26a1b">service@topfloridaproperties.com</a> · 305.900.5077</p>
      </body></html>`,
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
