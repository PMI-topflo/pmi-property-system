import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { sendEmail } from '@/lib/gmail'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const today     = new Date()
  const todayStr  = today.toISOString().slice(0, 10)
  const in30Days  = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  // 1. Mark expired tenants (lease_end_date <= today, still active)
  const { data: expiredRows, error: expiredErr } = await supabaseAdmin
    .from('association_tenants')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .lte('lease_end_date', todayStr)
    .not('status', 'in', '("previous","expired")')
    .select('id, first_name, last_name, email, association_code, association_name, unit_number, lease_end_date')

  if (expiredErr) {
    console.error('[cron/check-lease-expiry] expire update error:', expiredErr.message)
  }

  // Log expired transitions to tenant_history
  for (const t of expiredRows ?? []) {
    const name = [t.first_name, t.last_name].filter(Boolean).join(' ') || 'Tenant'
    void supabaseAdmin.from('tenant_history').insert({
      tenant_id:        t.id,
      association_code: t.association_code,
      unit_number:      t.unit_number,
      tenant_name:      name,
      action:           'expired',
      reason:           'lease_end_date_reached',
      performed_by:     'cron',
    })
  }

  // 2. Find tenants expiring within 30 days (still active, not already alerted today)
  const { data: expiringRows } = await supabaseAdmin
    .from('association_tenants')
    .select('id, first_name, last_name, email, association_code, association_name, unit_number, lease_end_date')
    .gt('lease_end_date', todayStr)
    .lte('lease_end_date', in30Days)
    .not('status', 'in', '("previous","expired")')

  const expiring = expiringRows ?? []

  // 3. Send staff alert if there are upcoming expirations or expired tenants
  const expiredList  = expiredRows ?? []
  const staffEmail   = process.env.STAFF_ALERT_EMAIL ?? 'PMI@topfloridaproperties.com'

  if (expiredList.length > 0 || expiring.length > 0) {
    const expiredHtml = expiredList.length > 0
      ? `<h3 style="color:#dc2626">Leases Expired Today (${expiredList.length})</h3>
         <table style="width:100%;border-collapse:collapse">
           <thead><tr>
             <th style="text-align:left;padding:6px 10px;background:#f9fafb;border:1px solid #e5e7eb">Tenant</th>
             <th style="text-align:left;padding:6px 10px;background:#f9fafb;border:1px solid #e5e7eb">Association</th>
             <th style="text-align:left;padding:6px 10px;background:#f9fafb;border:1px solid #e5e7eb">Unit</th>
             <th style="text-align:left;padding:6px 10px;background:#f9fafb;border:1px solid #e5e7eb">Lease Ended</th>
           </tr></thead>
           <tbody>
             ${expiredList.map(t => `<tr>
               <td style="padding:6px 10px;border:1px solid #e5e7eb">${[t.first_name, t.last_name].filter(Boolean).join(' ') || '—'}</td>
               <td style="padding:6px 10px;border:1px solid #e5e7eb">${t.association_name ?? t.association_code}</td>
               <td style="padding:6px 10px;border:1px solid #e5e7eb">${t.unit_number ?? '—'}</td>
               <td style="padding:6px 10px;border:1px solid #e5e7eb">${t.lease_end_date}</td>
             </tr>`).join('')}
           </tbody>
         </table>`
      : ''

    const expiringHtml = expiring.length > 0
      ? `<h3 style="color:#d97706">Leases Expiring Within 30 Days (${expiring.length})</h3>
         <table style="width:100%;border-collapse:collapse">
           <thead><tr>
             <th style="text-align:left;padding:6px 10px;background:#f9fafb;border:1px solid #e5e7eb">Tenant</th>
             <th style="text-align:left;padding:6px 10px;background:#f9fafb;border:1px solid #e5e7eb">Association</th>
             <th style="text-align:left;padding:6px 10px;background:#f9fafb;border:1px solid #e5e7eb">Unit</th>
             <th style="text-align:left;padding:6px 10px;background:#f9fafb;border:1px solid #e5e7eb">Expires</th>
           </tr></thead>
           <tbody>
             ${expiring.map(t => `<tr>
               <td style="padding:6px 10px;border:1px solid #e5e7eb">${[t.first_name, t.last_name].filter(Boolean).join(' ') || '—'}</td>
               <td style="padding:6px 10px;border:1px solid #e5e7eb">${t.association_name ?? t.association_code}</td>
               <td style="padding:6px 10px;border:1px solid #e5e7eb">${t.unit_number ?? '—'}</td>
               <td style="padding:6px 10px;border:1px solid #e5e7eb"><strong>${t.lease_end_date}</strong></td>
             </tr>`).join('')}
           </tbody>
         </table>`
      : ''

    void sendEmail({
      to:      staffEmail,
      subject: `Lease Expiry Alert — ${todayStr}`,
      html:    `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#222;max-width:700px;margin:0 auto;padding:20px">
        <div style="border-left:4px solid #f26a1b;padding-left:16px;margin-bottom:24px">
          <p style="font-size:18px;font-weight:600;margin:0">🏠 Lease Expiry Report</p>
          <p style="color:#6b7280;margin:4px 0 0">${todayStr}</p>
        </div>
        ${expiredHtml}${expiringHtml}
        <p><a href="https://www.pmitop.com/admin" style="background:#f26a1b;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;font-weight:600">View in Admin →</a></p>
        <p style="color:#6b7280;font-size:12px">— MAIA, PMI Top Florida Properties</p>
      </body></html>`,
    })
  }

  // 4. Send reminder emails to tenants expiring within 30 days (with known email)
  let remindersCount = 0
  for (const t of expiring) {
    if (!t.email) continue
    const name = [t.first_name, t.last_name].filter(Boolean).join(' ') || 'Resident'
    const daysLeft = Math.ceil((new Date(t.lease_end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    void sendEmail({
      to:      t.email,
      subject: `Lease Expiry Reminder — ${t.association_name ?? t.association_code}${t.unit_number ? `, Unit ${t.unit_number}` : ''}`,
      html:    `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#222;max-width:600px;margin:0 auto;padding:20px">
        <p>Dear ${name},</p>
        <p>This is a reminder that your lease for <strong>${t.unit_number ? `Unit ${t.unit_number}` : 'your unit'}</strong> at <strong>${t.association_name ?? t.association_code}</strong> is scheduled to expire on <strong>${t.lease_end_date}</strong> — in <strong>${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>.</p>
        <p>Please contact your property manager to discuss renewal or move-out arrangements:</p>
        <ul>
          <li>Email: <a href="mailto:PMI@topfloridaproperties.com">PMI@topfloridaproperties.com</a></li>
          <li>Phone: 305.900.5077</li>
        </ul>
        <p style="color:#6b7280;font-size:12px">— PMI Top Florida Properties</p>
      </body></html>`,
    })
    remindersCount++
  }

  return NextResponse.json({
    ok:         true,
    date:       todayStr,
    expired:    expiredList.length,
    expiring30: expiring.length,
    reminders:  remindersCount,
  })
}
