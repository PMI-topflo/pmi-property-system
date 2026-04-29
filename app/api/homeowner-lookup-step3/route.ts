import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

type Role =
  | { type: 'owner';  owner_id: number; association_code: string; association_name: string }
  | { type: 'tenant'; association_code: string; association_name: string }

export async function POST(req: NextRequest) {
  const { associationName, unit } = await req.json()
  if (!associationName?.trim() || associationName.trim().length < 3) {
    return NextResponse.json({ found: false, reason: 'missing_fields' })
  }

  const assocPattern = `%${associationName.trim()}%`

  const { data: assocs } = await supabaseAdmin
    .from('associations')
    .select('association_code, association_name')
    .ilike('association_name', assocPattern)
    .eq('active', true)
    .limit(5)

  if (!assocs?.length) return NextResponse.json({ found: false, assocFound: false })

  const codes = assocs.map(a => a.association_code)
  const nameMap: Record<string, string> = {}
  assocs.forEach(a => { nameMap[a.association_code] = a.association_name })

  if (!unit?.trim()) {
    // Association found but no unit — can't identify person yet
    return NextResponse.json({ found: false, assocFound: true, assocName: assocs[0].association_name })
  }

  const unitPattern = `%${unit.trim()}%`

  const [ownerRes, tenantRes] = await Promise.allSettled([
    supabaseAdmin
      .from('owners')
      .select('id, association_code')
      .in('association_code', codes)
      .ilike('unit_number', unitPattern)
      .limit(5),

    supabaseAdmin
      .from('association_tenants')
      .select('association_code')
      .in('association_code', codes)
      .ilike('unit_number', unitPattern)
      .limit(5),
  ])

  const roles: Role[] = []
  const seen = new Set<string>()

  if (ownerRes.status === 'fulfilled' && ownerRes.value.data) {
    for (const row of ownerRes.value.data as { id: number; association_code: string }[]) {
      const key = `owner:${row.id}`
      if (seen.has(key)) continue
      seen.add(key)
      roles.push({ type: 'owner', owner_id: row.id, association_code: row.association_code, association_name: nameMap[row.association_code] ?? row.association_code })
    }
  }

  if (tenantRes.status === 'fulfilled' && tenantRes.value.data) {
    for (const row of tenantRes.value.data as { association_code: string }[]) {
      const key = `tenant:${row.association_code}`
      if (seen.has(key)) continue
      seen.add(key)
      roles.push({ type: 'tenant', association_code: row.association_code, association_name: nameMap[row.association_code] ?? row.association_code })
    }
  }

  if (roles.length === 0) return NextResponse.json({ found: false, assocFound: true })
  return NextResponse.json({ found: true, roles })
}
