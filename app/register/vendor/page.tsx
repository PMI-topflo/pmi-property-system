'use client'

import { useState } from 'react'
import Image from 'next/image'

type Step = 1 | 2 | 3

const inputCls = 'w-full px-3 py-2.5 border border-[#e5e7eb] rounded-[2px] text-sm focus:outline-none focus:border-[#f26a1b] focus:shadow-[0_0_0_3px_rgba(242,106,27,.12)] bg-white text-[#0d0d0d] placeholder:text-[#9ca3af] transition-shadow'
const labelCls = 'block mb-1 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[#6b7280] [font-family:var(--font-mono)]'

const SERVICE_TYPES = ['Landscaping', 'Plumbing', 'Electrical', 'HVAC', 'Cleaning', 'Pool Service', 'Pest Control', 'Painting', 'Roofing', 'General Contractor', 'Security', 'Elevator', 'Other']

export default function RegisterVendorPage() {
  const [step, setStep]     = useState<Step>(1)
  const [busy, setBusy]     = useState(false)
  const [refNumber, setRef] = useState('')
  const [error, setError]   = useState('')

  // Form fields
  const [company,    setCompany]    = useState('')
  const [contact,    setContact]    = useState('')
  const [email,      setEmail]      = useState('')
  const [phone,      setPhone]      = useState('')
  const [service,    setService]    = useState('')
  const [license,    setLicense]    = useState('')
  const [assocNames, setAssocNames] = useState('')
  const [howHear,    setHowHear]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/register/vendor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, contact, email, phone, service, license, assocNames, howHear }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Submission failed. Please try again.'); return }
      setRef(data.refNumber ?? '')
      setStep(3)
    } catch { setError('Network error. Please try again.') } finally { setBusy(false) }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', flexDirection: 'column' }}>

      <div style={{ background: '#f26a1b', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem' }}>
        <span style={{ color: 'rgba(255,255,255,.85)', fontSize: '0.58rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>WHATSAPP &amp; SMS 24/7 · +1 (786) 686-3223</span>
        <a href="tel:+13059005077" style={{ color: '#fff', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>305.900.5077</a>
      </div>

      <header style={{ background: '#0d0d0d', height: '64px', display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '0.75rem' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <Image src="/pmi-logo-white.png" alt="PMI Top Florida Properties" width={130} height={40} style={{ objectFit: 'contain' }} priority />
        </a>
        <div style={{ color: '#6b7280', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Vendor Registration</div>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '520px' }}>

          {step === 3 ? (
            <div style={{ background: '#fff', borderRadius: '8px', padding: '2rem', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 300, color: '#0d0d0d', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Registration Received!</h1>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                Thank you, <strong>{company}</strong>! Our billing team will review your submission and reach out within 1 business day with ACH and COI instructions.
              </p>
              {refNumber && (
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: '0.25rem' }}>Reference Number</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f26a1b', fontSize: '1rem' }}>{refNumber}</div>
                </div>
              )}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>In the meantime, download the ACH Authorization Form:</p>
                <a href="/vendor-ach-form.pdf" download style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f26a1b', color: '#fff', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '2px', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  📄 Download ACH Form
                </a>
              </div>
              <a href="/" style={{ display: 'inline-block', border: '1px solid #e5e7eb', color: '#6b7280', textDecoration: 'none', padding: '0.5rem 1.25rem', borderRadius: '2px', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Back to Home
              </a>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '8px', padding: '2rem', border: '1px solid #e5e7eb' }}>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
                {[1, 2].map(s => (
                  <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: s <= step ? '#f26a1b' : '#e5e7eb', transition: 'background 0.3s' }} />
                ))}
              </div>

              <h1 style={{ fontSize: '1.25rem', fontWeight: 300, color: '#0d0d0d', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
                {step === 1 ? 'Vendor Registration' : 'Associations & Services'}
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                {step === 1 ? 'Register your company with PMI Top Florida Properties to receive work orders and payments.' : 'Which associations do you serve?'}
              </p>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#dc2626' }}>{error}</div>
              )}

              <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleSubmit} className="space-y-4">
                {step === 1 && (
                  <>
                    <div><label className={labelCls}>Company Name *</label><input required className={inputCls} value={company} onChange={e => setCompany(e.target.value)} /></div>
                    <div><label className={labelCls}>Contact Name</label><input className={inputCls} value={contact} onChange={e => setContact(e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={labelCls}>Email *</label><input required type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} /></div>
                      <div><label className={labelCls}>Phone</label><input type="tel" className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} /></div>
                    </div>
                    <div>
                      <label className={labelCls}>Service Type *</label>
                      <select required className={inputCls} value={service} onChange={e => setService(e.target.value)} style={{ cursor: 'pointer' }}>
                        <option value="">Select a service type…</option>
                        {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div><label className={labelCls}>License / Registration #</label><input className={inputCls} value={license} onChange={e => setLicense(e.target.value)} placeholder="FL contractor license or state registration" /></div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div>
                      <label className={labelCls}>Associations You Serve</label>
                      <textarea className={`${inputCls} resize-none`} rows={3} value={assocNames} onChange={e => setAssocNames(e.target.value)} placeholder="e.g. Venetian Isles, Gold Key 7, or All PMI associations…" />
                    </div>
                    <div><label className={labelCls}>How did you hear about us?</label><input className={inputCls} value={howHear} onChange={e => setHowHear(e.target.value)} placeholder="Referral, Google, Property Manager, etc." /></div>

                    <div style={{ background: '#fffbf5', border: '1px solid #fed7aa', borderRadius: '4px', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f26a1b', marginBottom: '0.25rem' }}>Required Documents After Approval</div>
                      <ul style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.8, margin: 0, paddingLeft: '1rem' }}>
                        <li>Certificate of Insurance (COI) naming PMI as additional insured</li>
                        <li>W-9 Form</li>
                        <li>ACH Authorization Form (download on confirmation page)</li>
                      </ul>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-1">
                  {step === 2 && (
                    <button type="button" onClick={() => setStep(1)} style={{ flex: 1, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.625rem', borderRadius: '2px', cursor: 'pointer' }}>
                      ← Back
                    </button>
                  )}
                  <button type="submit" disabled={busy} style={{ flex: 1, background: '#f26a1b', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.625rem', borderRadius: '2px', cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1, border: 'none' }}>
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
