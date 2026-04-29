import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export interface AddressResult {
  label: string
  sub: string
  association_code: string
  association_name: string
  principal_address?: string
  city?: string
  state?: string
  zip?: string
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 3) return NextResponse.json([])

  const pattern = `%${q}%`

  const [assocRes, ownerRes, tenantRes] = await Promise.allSettled([
    supabaseAdmin
      .from('associations')
      .select('association_code, association_name, principal_address, city, state, zip')
      .or(`principal_address.ilike.${pattern},association_name.ilike.${pattern},city.ilike.${pattern}`)
      .eq('active', true)
      .limit(5),

    supabaseAdmin
      .from('owners')
      .select('association_code, association_name, address, unit_number')
      .or(`address.ilike.${pattern},unit_number.ilike.${pattern}`)
      .limit(5),

    supabaseAdmin
      .from('association_tenants')
      .select('association_code, association_name, address, unit_number')
      .or(`address.ilike.${pattern},unit_number.ilike.${pattern}`)
      .limit(5),
  ])

  const results: AddressResult[] = []
  const seen = new Set<string>()

  if (assocRes.status === 'fulfilled' && assocRes.value.data) {
    for (const a of assocRes.value.data) {
      if (seen.has(a.association_code)) continue
      seen.add(a.association_code)
      const parts = [a.principal_address, a.city, a.state].filter(Boolean)
      results.push({
        label: a.association_name,
        sub: parts.join(', '),
        association_code: a.association_code,
        association_name: a.association_name,
        principal_address: a.principal_address ?? undefined,
        city: a.city ?? undefined,
        state: a.state ?? undefined,
        zip: a.zip ?? undefined,
      })
    }
  }

  for (const res of [ownerRes, tenantRes]) {
    if (res.status !== 'fulfilled' || !res.value.data) continue
    for (const row of res.value.data as { association_code: string; association_name: string; address?: string; unit_number?: string }[]) {
      if (!row.association_code || seen.has(row.association_code)) continue
      seen.add(row.association_code)
      const parts = [row.unit_number, row.address].filter(Boolean)
      results.push({
        label: row.association_name ?? row.association_code,
        sub: parts.join(' · '),
        association_code: row.association_code,
        association_name: row.association_name ?? row.association_code,
      })
    }
  }

  return NextResponse.json(results.slice(0, 5))
}
