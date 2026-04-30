'use client'

import { useState, useMemo } from 'react'

interface LoginEvent {
  id: string
  event: string
  identifier: string
  persona: string | null
  association_code: string | null
  association_name: string | null
  method: string | null
  ip_address: string | null
  success: boolean
  failure_reason: string | null
  created_at: string
}

interface Props { events: LoginEvent[] }

function ts(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function today() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function exportCSV(rows: LoginEvent[]) {
  const headers = ['Date/Time ET', 'Event', 'Identifier', 'Persona', 'Association', 'Method', 'IP', 'Status', 'Failure Reason']
  const lines = rows.map(r => [
    ts(r.created_at), r.event, r.identifier,
    r.persona ?? '', r.association_code ?? '',
    r.method ?? '', r.ip_address ?? '',
    r.success ? 'success' : 'failed',
    r.failure_reason ?? '',
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `login-history-${new Date().toISOString().slice(0, 10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

const EVENT_LABELS: Record<string, string> = {
  otp_sent:     'Code Sent',
  otp_verified: 'Verified',
  otp_failed:   'Failed',
}

export default function LoginHistoryDashboard({ events }: Props) {
  const [search,      setSearch]      = useState('')
  const [personaF,    setPersonaF]    = useState('')
  const [statusF,     setStatusF]     = useState('')
  const [assocF,      setAssocF]      = useState('')
  const [dateFrom,    setDateFrom]    = useState('')
  const [dateTo,      setDateTo]      = useState('')

  const todayStart = today()
  const todayEvents   = events.filter(e => new Date(e.created_at) >= todayStart)
  const failedToday   = todayEvents.filter(e => !e.success)
  const assocCounts   = events.reduce<Record<string, number>>((acc, e) => {
    if (e.association_code) acc[e.association_code] = (acc[e.association_code] ?? 0) + 1
    return acc
  }, {})
  const topAssoc = Object.entries(assocCounts).sort((a, b) => b[1] - a[1])[0]

  const personas   = [...new Set(events.map(e => e.persona).filter(Boolean))] as string[]
  const assocCodes = [...new Set(events.map(e => e.association_code).filter(Boolean))] as string[]

  const filtered = useMemo(() => {
    return events.filter(e => {
      if (search && !e.identifier.includes(search) && !(e.association_code ?? '').includes(search) && !(e.persona ?? '').includes(search)) return false
      if (personaF && e.persona !== personaF) return false
      if (statusF === 'success' && !e.success) return false
      if (statusF === 'failed'  &&  e.success) return false
      if (assocF  && e.association_code !== assocF) return false
      if (dateFrom && new Date(e.created_at) < new Date(dateFrom)) return false
      if (dateTo   && new Date(e.created_at) > new Date(dateTo + 'T23:59:59')) return false
      return true
    })
  }, [events, search, personaF, statusF, assocF, dateFrom, dateTo])

  const statCls = 'bg-white border border-gray-200 rounded-lg p-4'
  const inputCls = 'border border-gray-200 rounded px-3 py-1.5 text-[0.72rem] font-mono focus:outline-none focus:border-[#f26a1b] bg-white'

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={statCls}>
          <div className="text-[0.6rem] font-mono uppercase tracking-wider text-gray-400 mb-1">Logins Today</div>
          <div className="text-2xl font-bold text-[#f26a1b]">{todayEvents.filter(e => e.success).length}</div>
        </div>
        <div className={statCls}>
          <div className="text-[0.6rem] font-mono uppercase tracking-wider text-gray-400 mb-1">Failed Attempts Today</div>
          <div className="text-2xl font-bold text-red-500">{failedToday.length}</div>
        </div>
        <div className={statCls}>
          <div className="text-[0.6rem] font-mono uppercase tracking-wider text-gray-400 mb-1">Total (30 days)</div>
          <div className="text-2xl font-bold text-gray-700">{events.length}</div>
        </div>
        <div className={statCls}>
          <div className="text-[0.6rem] font-mono uppercase tracking-wider text-gray-400 mb-1">Most Active Assoc</div>
          <div className="text-base font-bold text-gray-700 truncate">{topAssoc ? `${topAssoc[0]} (${topAssoc[1]})` : '—'}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 mb-4 flex flex-wrap items-center gap-3">
        <input
          className={`${inputCls} w-52`}
          placeholder="Search identifier, persona…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className={inputCls} value={personaF} onChange={e => setPersonaF(e.target.value)}>
          <option value="">All personas</option>
          {personas.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className={inputCls} value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        {assocCodes.length > 0 && (
          <select className={inputCls} value={assocF} onChange={e => setAssocF(e.target.value)}>
            <option value="">All associations</option>
            {assocCodes.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        )}
        <input type="date" className={inputCls} value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="From" />
        <input type="date" className={inputCls} value={dateTo}   onChange={e => setDateTo(e.target.value)}   title="To" />
        <div className="ml-auto">
          <button
            onClick={() => exportCSV(filtered)}
            className="text-[0.62rem] font-mono uppercase tracking-wider px-4 py-1.5 rounded border border-gray-300 text-gray-600 hover:border-[#f26a1b] hover:text-[#f26a1b] transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Date/Time', 'Event', 'Identifier', 'Persona', 'Association', 'Method', 'IP', 'Status'].map(h => (
                  <th key={h} className="text-left text-[0.6rem] font-mono uppercase tracking-wider text-gray-400 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-gray-400 text-[0.75rem] py-12 font-mono">No records found</td></tr>
              ) : filtered.map(e => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-[0.72rem] font-mono text-gray-500 whitespace-nowrap">{ts(e.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[0.6rem] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      e.event === 'otp_verified' ? 'bg-green-50 text-green-600' :
                      e.event === 'otp_failed'   ? 'bg-red-50 text-red-500' :
                      'bg-blue-50 text-blue-500'
                    }`}>{EVENT_LABELS[e.event] ?? e.event}</span>
                  </td>
                  <td className="px-4 py-3 text-[0.75rem] text-gray-700 font-mono max-w-[180px] truncate">{e.identifier}</td>
                  <td className="px-4 py-3 text-[0.72rem] text-gray-500 font-mono capitalize">{e.persona ?? '—'}</td>
                  <td className="px-4 py-3 text-[0.72rem] text-gray-500 font-mono">{e.association_code ?? '—'}</td>
                  <td className="px-4 py-3 text-[0.72rem] text-gray-500 font-mono uppercase">{e.method ?? '—'}</td>
                  <td className="px-4 py-3 text-[0.65rem] text-gray-400 font-mono whitespace-nowrap">{e.ip_address ?? '—'}</td>
                  <td className="px-4 py-3">
                    {e.success ? (
                      <span className="text-[0.6rem] font-mono uppercase text-green-600">✓ OK</span>
                    ) : (
                      <span className="text-[0.6rem] font-mono uppercase text-red-500" title={e.failure_reason ?? ''}>✗ {e.failure_reason?.replace('_', ' ') ?? 'fail'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-gray-100 text-[0.65rem] text-gray-400 font-mono">
          Showing {filtered.length} of {events.length} events
        </div>
      </div>
    </div>
  )
}
