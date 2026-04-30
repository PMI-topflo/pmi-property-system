import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

interface RentvineLease {
  lease: {
    leaseID:  number
    tenants?: Array<{ contactID: number; name: string; email?: string; phone?: string }>
  }
  unit:          { address: string; unitNumber?: string }
  leaseStartDate: string
  leaseEndDate:   string
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const base   = process.env.RENTVINE_BASE_URL
  const key    = process.env.RENTVINE_ACCESS_KEY
  const secret = process.env.RENTVINE_SECRET

  if (!base || !key || !secret) {
    return NextResponse.json({ ok: false, error: 'Rentvine credentials not configured' }, { status: 500 })
  }

  const creds = Buffer.from(`${key}:${secret}`).toString('base64')
  const headers = { Authorization: `Basic ${creds}`, 'Content-Type': 'application/json' }

  let leases: RentvineLease[] = []
  try {
    const res  = await fetch(`${base}/leases/export`, { headers })
    const json = await res.json()
    leases = json?.data ?? []
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[cron/sync-rentvine-tenants] fetch error:', msg)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }

  const today   = new Date().toISOString().slice(0, 10)
  let archived  = 0
  let added     = 0
  const errors: string[] = []

  for (const lease of leases) {
    const leaseEnd     = lease.leaseEndDate?.slice(0, 10)
    const leaseStart   = lease.leaseStartDate?.slice(0, 10)
    const unitAddress  = lease.unit?.address ?? ''
    const unitNumber   = lease.unit?.unitNumber ?? null

    // Match to a known association by unit address
    const { data: assoc } = await supabaseAdmin
      .from('associations')
      .select('association_code, association_name')
      .ilike('address', `%${unitAddress.split(',')[0].trim()}%`)
      .maybeSingle()

    if (!assoc) continue  // can't match to a known association

    const { association_code, association_name } = assoc

    for (const tenant of lease.lease?.tenants ?? []) {
      const tenantName = tenant.name ?? ''
      const nameParts  = tenantName.split(' ')
      const firstName  = nameParts[0] ?? null
      const lastName   = nameParts.slice(1).join(' ') || null

      // Check if this tenant already exists in our DB by Rentvine contact ID or email match
      const rentvineId = String(tenant.contactID)
      const { data: existing } = await supabaseAdmin
        .from('association_tenants')
        .select('id, status, lease_end_date')
        .eq('association_code', association_code)
        .eq('rentvine_contact_id', rentvineId)
        .maybeSingle()

      if (existing) {
        // Archive if lease has ended and record is still active
        if (leaseEnd && leaseEnd < today && existing.status !== 'previous' && existing.status !== 'expired') {
          await supabaseAdmin
            .from('association_tenants')
            .update({ status: 'expired', lease_end_date: leaseEnd, updated_at: new Date().toISOString() })
            .eq('id', existing.id)

          void supabaseAdmin.from('tenant_history').insert({
            tenant_id:        existing.id,
            association_code,
            unit_number:      unitNumber,
            tenant_name:      tenantName,
            action:           'expired',
            reason:           'rentvine_sync',
            performed_by:     'cron',
          })
          archived++
        }
      } else if (leaseEnd && leaseEnd >= today) {
        // New active tenant found in Rentvine — add to DB without board approval (residential)
        const { data: newRow, error } = await supabaseAdmin
          .from('association_tenants')
          .insert({
            association_code,
            association_name,
            unit_number:        unitNumber,
            first_name:         firstName,
            last_name:          lastName,
            email:              tenant.email ?? null,
            phone:              tenant.phone ?? null,
            status:             'active',
            lease_start_date:   leaseStart ?? null,
            lease_end_date:     leaseEnd,
            rentvine_contact_id: rentvineId,
            added_by:           'rentvine_sync',
          })
          .select('id')
          .maybeSingle()

        if (error) {
          if (error.code !== '23505') errors.push(`tenant ${rentvineId}: ${error.message}`)
        } else if (newRow) {
          void supabaseAdmin.from('tenant_history').insert({
            tenant_id:        newRow.id,
            association_code,
            unit_number:      unitNumber,
            tenant_name:      tenantName,
            action:           'added',
            reason:           'rentvine_sync',
            performed_by:     'cron',
          })
          added++
        }
      }
    }
  }

  console.log(`[cron/sync-rentvine-tenants] archived=${archived} added=${added} errors=${errors.length}`)
  return NextResponse.json({ ok: true, date: today, leasesChecked: leases.length, archived, added, errors })
}
