import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

type Role =
  | { type: 'owner';  owner_id: number; association_code: string; association_name: string }
  | { type: 'tenant'; association_code: string; association_name: string }

export async function POST(req: NextRequest) {
  const { address } = await req.json()
  if (!address?.trim() || address.trim().length < 3) {
    return NextResponse.json({ found: false, reason: 'missing_fields' })
  }

  const pattern = `%${address.trim()}%`

  const [ownerRes, tenantRes] = await Promise.allSettled([
    supabaseAdmin
      .from('owners')
      .select('id, association_code, association_name')
      .or(`address.ilike.${pattern},unit_number.ilike.${pattern}`)
      .limit(5),

    supabaseAdmin
      .from('association_tenants')
      .select('association_code, association_name')
      .or(`address.ilike.${pattern},unit_number.ilike.${pattern}`)
      .limit(5),
  ])

  const roles: Role[] = []
  const seen = new Set<string>()

  if (ownerRes.status === 'fulfilled' && ownerRes.value.data) {
    for (const row of ownerRes.value.data as { id: number; association_code: string; association_name: string }[]) {
      const key = `owner:${row.id}`
      if (seen.has(key) || !row.association_code) continue
      seen.add(key)
      roles.push({ type: 'owner', owner_id: row.id, association_code: row.association_code, association_name: row.association_name ?? row.association_code })
    }
  }

  if (tenantRes.status === 'fulfilled' && tenantRes.value.data) {
    for (const row of tenantRes.value.data as { association_code: string; association_name: string }[]) {
      const key = `tenant:${row.association_code}`
      if (seen.has(key) || !row.association_code) continue
      seen.add(key)
      roles.push({ type: 'tenant', association_code: row.association_code, association_name: row.association_name ?? row.association_code })
    }
  }

  if (roles.length === 0) return NextResponse.json({ found: false })
  return NextResponse.json({ found: true, roles })
}
