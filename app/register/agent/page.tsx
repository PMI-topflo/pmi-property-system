'use client'

import { useState } from 'react'
import Image from 'next/image'

type Step = 1 | 2 | 3

const inputCls = 'w-full px-3 py-2.5 border border-[#e5e7eb] rounded-[2px] text-sm focus:outline-none focus:border-[#f26a1b] focus:shadow-[0_0_0_3px_rgba(242,106,27,.12)] bg-white text-[#0d0d0d] placeholder:text-[#9ca3af] transition-shadow'
const labelCls = 'block mb-1 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[#6b7280] [font-family:var(--font-mono)]'

export default function RegisterAgentPage() {
  const [step, setStep]         = useState<Step>(1)
  const [busy, setBusy]         = useState(false)
  const [refNumber, setRef]     = useState('')
  const [error, setError]       = useState('')

  // Form fields
  const [fullName,   setFullName]   = useState('')
  const [email,      setEmail]      = useState('')
  const [phone,      setPhone]      = useState('')
  const [license,    setLicense]    = useState('')
  const [expiry,     setExpiry]     = useState('')
  const [brokerage,  setBrokerage]  = useState('')
  const [howHear,    setHowHear]    = useState('')
  const [assocNames, setAssocNames] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/register/agent', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, license, expiry, brokerage, howHear, assocNames }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Submission failed. Please try again.'); return }
      setRef(data.refNumber ?? '')
      setStep(3)
    } catch { setError('Network error. Please try again.') } finally { setBusy(false) }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ background: '#f26a1b', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem' }}>
        <span style={{ color: 'rgba(255,255,255,.85)', fontSize: '0.58rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          WHATSAPP &amp; SMS 24/7 · +1 (786) 686-3223
        </span>
        <a href="tel:+13059005077" style={{ color: '#fff', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>305.900.5077</a>
      </div>

      {/* Header */}
      <header style={{ background: '#0d0d0d', height: '64px', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '0.75rem' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <Image src="/pmi-logo-white.png" alt="PMI Top Florida Properties" width={130} height={40} style={{ objectFit: 'contain' }} priority />
        </a>
        <div style={{ color: '#6b7280', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Agent Registration
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>

          {step === 3 ? (
            <div style={{ background: '#fff', borderRadius: '8px', padding: '2rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 300, color: '#0d0d0d', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Registration Received!</h1>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Thank you, {fullName}! Our team will review your information and get back to you within 1 business day.
              </p>
              {refNumber && (
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: '0.25rem' }}>Reference Number</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f26a1b', fontSize: '1rem' }}>{refNumber}</div>
                </div>
              )}
              <a href="/" style={{ display: 'inline-block', background: '#f26a1b', color: '#fff', textDecoration: 'none', padding: '0.625rem 1.5rem', borderRadius: '2px', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Back to Home
              </a>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '8px', padding: '2rem', border: '1px solid #e5e7eb' }}>

              {/* Progress */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
                {[1, 2].map(s => (
                  <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: s <= step ? '#f26a1b' : '#e5e7eb', transition: 'background 0.3s' }} />
                ))}
              </div>

              <h1 style={{ fontSize: '1.25rem', fontWeight: 300, color: '#0d0d0d', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
                {step === 1 ? 'Real Estate Agent Registration' : 'Additional Details'}
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                {step === 1 ? 'Join our preferred agent network for PMI Top Florida associations.' : 'Tell us about your preferred associations and how you found us.'}
              </p>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#dc2626' }}>
                  {error}
                </div>
              )}

              <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleSubmit} className="space-y-4">
                {step === 1 && (
                  <>
                    <div><label className={labelCls}>Full Name *</label><input required className={inputCls} value={fullName} onChange={e => setFullName(e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={labelCls}>Email *</label><input required type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} /></div>
                      <div><label className={labelCls}>Phone *</label><input required type="tel" className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={labelCls}>FL License Number *</label><input required className={inputCls} value={license} onChange={e => setLicense(e.target.value)} placeholder="SL3000000" /></div>
                      <div><label className={labelCls}>License Expiry</label><input type="date" className={inputCls} value={expiry} onChange={e => setExpiry(e.target.value)} /></div>
                    </div>
                    <div><label className={labelCls}>Brokerage / Firm</label><input className={inputCls} value={brokerage} onChange={e => setBrokerage(e.target.value)} /></div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div>
                      <label className={labelCls}>Which Associations Do You Work With?</label>
                      <textarea className={`${inputCls} resize-none`} rows={3} value={assocNames} onChange={e => setAssocNames(e.target.value)} placeholder="e.g. Venetian Isles, Gold Key 7, Galleria Village..." />
                      <p style={{ fontSize: '0.62rem', color: '#9ca3af', marginTop: '4px' }}>Separate multiple associations with commas</p>
                    </div>
                    <div>
                      <label className={labelCls}>How did you hear about us?</label>
                      <input className={inputCls} value={howHear} onChange={e => setHowHear(e.target.value)} placeholder="Referral, Google, MLS, etc." />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-1">
                  {step === 2 && (
                    <button type="button" onClick={() => setStep(1)} style={{ flex: 1, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.625rem', borderRadius: '2px', cursor: 'pointer' }}>
                      ← Back
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={busy}
                    style={{ flex: 1, background: '#f26a1b', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.625rem', borderRadius: '2px', cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1, border: 'none' }}
                  >
                    {busy ? 'Submitting…' : step === 1 ? 'Continue →' : 'Submit Registration'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
