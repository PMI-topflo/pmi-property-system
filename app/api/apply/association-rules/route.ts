import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ sections: [] })

  const { data } = await supabaseAdmin
    .from('association_config')
    .select('rules_sections')
    .eq('association_code', code)
    .maybeSingle()

  return NextResponse.json({ sections: (data?.rules_sections as string[] | null) ?? [] })
}
