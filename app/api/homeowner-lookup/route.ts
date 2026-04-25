import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, phone } = await req.json()

  if (!email && !phone) {
    return NextResponse.json({ found: false, reason: 'missing_fields' })
  }

  // Normalize phone to last 10 digits for flexible matching
  const digits = (phone ?? '').replace(/\D/g, '').slice(-10)

  // ── Staff check (silent — never exposed in response) ──────────────────────
  {
    let staffQuery = supabaseAdmin
      .from('pmi_staff')
      .select('id')
      .eq('active', true)

    if (email && digits.length >= 7) {
      staffQuery = staffQuery.or(`email.ilike.%${email}%,phone.ilike.%${digits}%`)
    } else if (email) {
      staffQuery = staffQuery.ilike('email', `%${email}%`)
    } else {
      staffQuery = staffQuery.ilike('phone', `%${digits}%`)
    }

    const { data: staff } = await staffQuery.limit(1).single()
    if (staff?.id) {
      return NextResponse.json({ found: true, staff: true })
    }
  }

  // ── Search owners table ────────────────────────────────────────────────────
  if (email) {
    const { data: byEmail } = await supabaseAdmin
      .from('owners')
      .select('association_code, association_name, first_name, last_name')
      .ilike('emails', `%${email}%`)
      .limit(1)
      .single()

    if (byEmail?.association_code) {
      return NextResponse.json({ found: true, ...byEmail })
    }
  }

  if (digits.length >= 7) {
    const { data: byPhone } = await supabaseAdmin
      .from('owners')
      .select('association_code, association_name, first_name, last_name')
      .ilike('phone', `%${digits}%`)
      .limit(1)
      .single()

    if (byPhone?.association_code) {
      return NextResponse.json({ found: true, ...byPhone })
    }
  }

  // ── Search association_tenants table ───────────────────────────────────────
  if (email) {
    const { data: tenantByEmail } = await supabaseAdmin
      .from('association_tenants')
      .select('association_code, first_name, last_name')
      .ilike('email', `%${email}%`)
      .limit(1)
      .single()

    if (tenantByEmail?.association_code) {
      return NextResponse.json({ found: true, association_name: '', ...tenantByEmail })
    }
  }

  if (digits.length >= 7) {
    const { data: tenantByPhone } = await supabaseAdmin
      .from('association_tenants')
      .select('association_code, first_name, last_name')
      .ilike('phone', `%${digits}%`)
      .limit(1)
      .single()

    if (tenantByPhone?.association_code) {
      return NextResponse.json({ found: true, association_name: '', ...tenantByPhone })
    }
  }

  return NextResponse.json({ found: false })
}
