'use client'

import { useState, useEffect, useRef } from 'react'
import type { AddressResult } from '@/app/api/address-search/route'

interface AddressSearchProps {
  label: string
  selected: AddressResult | null
  onSelect: (result: AddressResult | null) => void
  dark?: boolean
  placeholder?: string
}

export default function AddressSearch({ label, selected, onSelect, dark = false, placeholder }: AddressSearchProps) {
  const [query, setQuery]     = useState(selected?.association_name ?? '')
  const [results, setResults] = useState<AddressResult[]>([])
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 3) { setResults([]); setOpen(false); setNotFound(false); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true); setNotFound(false)
      try {
        const res  = await fetch(`/api/address-search?q=${encodeURIComponent(query)}`)
        const data: AddressResult[] = await res.json()
        setResults(data)
        setOpen(data.length > 0)
        setNotFound(data.length === 0)
      } catch { setNotFound(true) } finally { setLoading(false) }
    }, 300)
  }, [query])

  const inputCls = dark
    ? 'w-full px-3 py-2.5 border border-[#333] rounded-[2px] text-sm focus:outline-none focus:border-[#f26a1b] focus:shadow-[0_0_0_3px_rgba(242,106,27,.18)] bg-[#1a1a1a] text-white placeholder:text-[#555] transition-shadow'
    : 'w-full px-3 py-2.5 border border-[#e5e7eb] rounded-[2px] text-sm focus:outline-none focus:border-[#f26a1b] focus:shadow-[0_0_0_3px_rgba(242,106,27,.12)] bg-white text-[#0d0d0d] placeholder:text-[#9ca3af] transition-shadow'

  const labelCls = dark
    ? 'block mb-1 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[#9ca3af] [font-family:var(--font-mono)]'
    : 'block mb-1 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[#6b7280] [font-family:var(--font-mono)]'

  return (
    <div ref={containerRef} className="relative">
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); if (!e.target.value) onSelect(null) }}
          placeholder={placeholder ?? 'Enter property address, unit number, or community name'}
          className={inputCls}
          dir="ltr"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-[#f26a1b] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {selected && !loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4ade80] text-sm">✓</div>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full mt-1 z-50 rounded-[3px] overflow-hidden"
          style={{
            background:  dark ? '#1c1c1c' : '#fff',
            border:      dark ? '1px solid #2a2a2a' : '1px solid #e5e7eb',
            boxShadow:   '0 8px 24px rgba(0,0,0,0.35)',
          }}
        >
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setQuery(r.association_name); setOpen(false); setNotFound(false); onSelect(r) }}
              className={`w-full text-left px-3 py-2.5 transition-colors ${
                dark
                  ? 'border-b border-[#222] last:border-0 hover:bg-white/[0.05]'
                  : 'border-b border-[#f3f4f6] last:border-0 hover:bg-orange-50'
              }`}
            >
              <div className={`text-[0.82rem] font-semibold ${dark ? 'text-white' : 'text-[#0d0d0d]'}`}>{r.label}</div>
              {r.sub && (
                <div className={`text-[0.68rem] mt-0.5 [font-family:var(--font-mono)] ${dark ? 'text-[#9ca3af]' : 'text-[#6b7280]'}`}>
                  {r.sub}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Not found */}
      {notFound && query.length >= 3 && !open && (
        <p className={`mt-1.5 text-[0.68rem] leading-snug ${dark ? 'text-[#9ca3af]' : 'text-[#6b7280]'}`}>
          Address not found — contact us at{' '}
          <a href="mailto:maia@pmitop.com" className="text-[#f26a1b] hover:underline">maia@pmitop.com</a>
        </p>
      )}
    </div>
  )
}
