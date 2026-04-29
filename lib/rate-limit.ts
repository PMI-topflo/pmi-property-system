import { supabaseAdmin } from '@/lib/supabase-admin'

/**
 * Simple Supabase-backed rate limiter.
 * Uses the otp_verifications table's (identifier, created_at) to count recent attempts.
 * Falls back to allowing the request if Supabase is unavailable (fail-open).
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
  maxAttempts: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const since = new Date(Date.now() - windowMs).toISOString()
    const { count } = await supabaseAdmin
      .from('otp_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .eq('method', action)
      .gte('created_at', since)

    const used      = count ?? 0
    const remaining = Math.max(0, maxAttempts - used)
    return { allowed: remaining > 0, remaining }
  } catch {
    return { allowed: true, remaining: maxAttempts }
  }
}
