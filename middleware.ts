import { NextRequest, NextResponse } from 'next/server'
import { verifySession, SESSION_COOKIE } from '@/lib/session'

const PROTECTED: Record<string, 'owner' | 'board' | 'staff'> = {
  '/my-account': 'owner',
  '/board':      'board',
  '/admin':      'staff',
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Find matching protected route prefix
  const requiredPersona = Object.entries(PROTECTED).find(([prefix]) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  )?.[1]

  if (!requiredPersona) return NextResponse.next()

  const token   = req.cookies.get(SESSION_COOKIE)?.value
  const session = token ? verifySession(token) : null

  if (!session) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/'
    loginUrl.searchParams.set('return', pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // Staff can access everything; check specific persona otherwise
  if (session.persona !== 'staff' && session.persona !== requiredPersona) {
    const homeUrl = req.nextUrl.clone()
    homeUrl.pathname = '/'
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/my-account/:path*', '/board/:path*', '/admin/:path*'],
}
