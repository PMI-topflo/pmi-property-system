import { createHmac, timingSafeEqual } from 'crypto'

const SECRET = process.env.MAIA_SESSION_SECRET ?? 'maia-dev-secret-change-in-prod'
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000

export interface SessionData {
  userId:          string | number
  persona:         'owner' | 'board' | 'staff' | 'tenant'
  associationCode: string
  displayName:     string
  contactName:     string   // person's full name for welcome message
  issuedAt:        number
  expiresAt:       number
}

export function signSession(data: SessionData): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url')
  const sig     = createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifySession(token: string): SessionData | null {
  try {
    const dot = token.lastIndexOf('.')
    if (dot < 0) return null
    const payload  = token.slice(0, dot)
    const sig      = token.slice(dot + 1)
    const expected = createHmac('sha256', SECRET).update(payload).digest('base64url')
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as SessionData
    if (data.expiresAt < Date.now()) return null
    return data
  } catch { return null }
}

export function makeSession(data: Omit<SessionData, 'issuedAt' | 'expiresAt'>): SessionData {
  const now = Date.now()
  return { ...data, issuedAt: now, expiresAt: now + THIRTY_DAYS }
}

export const SESSION_COOKIE = 'maia_session'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30  // 30 days in seconds
