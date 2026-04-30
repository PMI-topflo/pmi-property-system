'use client'

import { useState } from 'react'

interface Conversation {
  id: string
  session_id: string | null
  persona: string | null
  language: string | null
  association_code: string | null
  status: string
  channel: string | null
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  summary: string | null
  messages: Array<{ role: string; content: string }> | null
  created_at: string
}

interface Props { conversations: Conversation[] }

type ActionModal =
  | { type: 'add_owner' | 'add_board' | 'add_agent' | 'add_vendor' | 'add_staff' | 'follow_up'; convId: string; prefill: Record<string, string> }
  | null

function extractInfo(conv: Conversation): { name: string; email: string; phone: string; association: string; unit: string } {
  const systemMsg = conv.messages?.find(m => m.role === 'system')
  try {
    const parsed = JSON.parse(systemMsg?.content ?? '{}')
    return {
      name:        [parsed.firstName, parsed.lastName].filter(Boolean).join(' ') || conv.contact_name || '',
      email:       parsed.email || conv.contact_email || '',
      phone:       parsed.phone || conv.contact_phone || '',
      association: parsed.association || conv.association_code || '',
      unit:        parsed.unit || '',
    }
  } catch {
    return {
      name:        conv.contact_name || '',
      email:       conv.contact_email || '',
      phone:       conv.contact_phone || '',
      association: conv.association_code || '',
      unit:        '',
    }
  }
}

function ts(iso: string) {
  return new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const inputCls = 'w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#f26a1b]'
const labelCls = 'block text-[0.6rem] font-medium uppercase tracking-[0.1em] text-gray-400 mb-1 font-mono'

export default function PendingApprovalsDashboard({ conversations: initial }: Props) {
  const [items, setItems]     = useState(initial)
  const [modal, setModal]     = useState<ActionModal>(null)
  const [formData, setForm]   = useState<Record<string, string>>({})
  const [busy, setBusy]       = useState(false)
  const [error, setError]     = useState('')

  function openModal(type: Exclude<ActionModal, null>['type'], conv: Conversation) {
    const info = extractInfo(conv)
    setForm({ name: info.name, email: info.email, phone: info.phone, association_code: info.association, unit_number: info.unit })
    setModal({ type, convId: conv.id, prefill: {} })
    setError('')
  }

  async function handleAction(action: string, convId: string, data: Record<string, string>) {
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/admin/pending-approvals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, conversationId: convId, data }),
      })
      const json = await res.json()
      if (!json.ok) { setError(json.error ?? 'Failed'); setBusy(false); return }
      setItems(prev => prev.filter(c => c.id !== convId))
      setModal(null)
    } catch { setError('Network error') } finally { setBusy(false) }
  }

  async function dismiss(convId: string) {
    await handleAction('dismiss', convId, {})
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <div className="text-5xl mb-4">✓</div>
        <p className="text-sm font-mono uppercase tracking-widest">No pending approvals</p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-4">
        {items.map(conv => {
          const info = extractInfo(conv)
          return (
            <div key={conv.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{info.name || 'Unknown Visitor'}</span>
                    <span className="text-[0.55rem] font-mono uppercase tracking-widest text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
                      {conv.channel ?? 'web'}
                    </span>
                    {conv.language && conv.language !== 'en' && (
                      <span className="text-[0.55rem] font-mono uppercase tracking-widest text-[#f26a1b] border border-[#f26a1b]/30 rounded-full px-2 py-0.5">
                        {conv.language.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[0.72rem] text-gray-500">
                    {info.email  && <span>✉ {info.email}</span>}
                    {info.phone  && <span>📱 {info.phone}</span>}
                    {info.association && <span>🏢 {info.association}</span>}
                    {info.unit   && <span>Unit {info.unit}</span>}
                  </div>
                  {conv.summary && (
                    <p className="text-[0.75rem] text-gray-400 mt-2 line-clamp-2">{conv.summary}</p>
                  )}
                  <p className="text-[0.65rem] text-gray-300 font-mono mt-1.5">
                    {ts(conv.created_at)} · Ref: {conv.session_id ?? '—'}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 px-5 py-3 flex flex-wrap items-center gap-2 bg-gray-50">
                <span className="text-[0.6rem] text-gray-400 font-mono uppercase tracking-wider mr-2">Add as →</span>
                {[
                  { action: 'add_owner',  label: 'Owner'  },
                  { action: 'add_board',  label: 'Board'  },
                  { action: 'add_agent',  label: 'Agent'  },
                  { action: 'add_vendor', label: 'Vendor' },
                  { action: 'add_staff',  label: 'Staff'  },
                ].map(({ action, label }) => (
                  <button
                    key={action}
                    onClick={() => openModal(action as Exclude<ActionModal, null>['type'], conv)}
                    className="text-[0.65rem] font-mono uppercase tracking-wider px-3 py-1.5 rounded border border-[#f26a1b]/40 text-[#f26a1b] hover:bg-[#f26a1b] hover:text-white transition-colors"
                  >
                    {label}
                  </button>
                ))}
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => openModal('follow_up', conv)}
                    className="text-[0.65rem] font-mono uppercase tracking-wider px-3 py-1.5 rounded border border-gray-300 text-gray-500 hover:border-gray-400 transition-colors"
                  >
                    Follow Up
                  </button>
                  <button
                    onClick={() => dismiss(conv.id)}
                    className="text-[0.65rem] font-mono uppercase tracking-wider px-3 py-1.5 rounded border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                {modal.type === 'follow_up' ? 'Send Follow-Up Email' : `Add as ${modal.type.replace('add_', '').charAt(0).toUpperCase() + modal.type.replace('add_', '').slice(1)}`}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="px-6 py-5 space-y-3">
              {modal.type === 'follow_up' ? (
                <>
                  <div><label className={labelCls}>To Email</label><input className={inputCls} value={formData.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><label className={labelCls}>Subject</label><input className={inputCls} value={formData.subject ?? 'Following up from PMI Top Florida'} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></div>
                  <div><label className={labelCls}>Message</label><textarea rows={4} className={inputCls} value={formData.body ?? ''} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} /></div>
                </>
              ) : modal.type === 'add_owner' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>First Name</label><input className={inputCls} value={formData.first_name ?? formData.name?.split(' ')[0] ?? ''} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} /></div>
                    <div><label className={labelCls}>Last Name</label><input className={inputCls} value={formData.last_name ?? formData.name?.split(' ').slice(1).join(' ') ?? ''} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} /></div>
                  </div>
                  <div><label className={labelCls}>Email</label><input className={inputCls} value={formData.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><label className={labelCls}>Phone</label><input className={inputCls} value={formData.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>Association Code</label><input className={inputCls} value={formData.association_code ?? ''} onChange={e => setForm(f => ({ ...f, association_code: e.target.value }))} /></div>
                    <div><label className={labelCls}>Unit</label><input className={inputCls} value={formData.unit_number ?? ''} onChange={e => setForm(f => ({ ...f, unit_number: e.target.value }))} /></div>
                  </div>
                </>
              ) : modal.type === 'add_board' ? (
                <>
                  <div><label className={labelCls}>Full Name</label><input className={inputCls} value={formData.full_name ?? formData.name ?? ''} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} /></div>
                  <div><label className={labelCls}>Email</label><input className={inputCls} value={formData.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><label className={labelCls}>Phone</label><input className={inputCls} value={formData.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>Association Code</label><input className={inputCls} value={formData.association_code ?? ''} onChange={e => setForm(f => ({ ...f, association_code: e.target.value }))} /></div>
                    <div><label className={labelCls}>Position</label><input className={inputCls} placeholder="President, Treasurer…" value={formData.position ?? ''} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} /></div>
                  </div>
                </>
              ) : modal.type === 'add_agent' ? (
                <>
                  <div><label className={labelCls}>Full Name</label><input className={inputCls} value={formData.full_name ?? formData.name ?? ''} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} /></div>
                  <div><label className={labelCls}>Email</label><input className={inputCls} value={formData.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><label className={labelCls}>Phone</label><input className={inputCls} value={formData.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div><label className={labelCls}>License Number</label><input className={inputCls} value={formData.license_number ?? ''} onChange={e => setForm(f => ({ ...f, license_number: e.target.value }))} /></div>
                </>
              ) : modal.type === 'add_vendor' ? (
                <>
                  <div><label className={labelCls}>Company Name</label><input className={inputCls} value={formData.company_name ?? ''} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} /></div>
                  <div><label className={labelCls}>Contact Name</label><input className={inputCls} value={formData.contact_name ?? formData.name ?? ''} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} /></div>
                  <div><label className={labelCls}>Email</label><input className={inputCls} value={formData.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><label className={labelCls}>Phone</label><input className={inputCls} value={formData.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div><label className={labelCls}>Service Type</label><input className={inputCls} value={formData.service_type ?? ''} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))} /></div>
                </>
              ) : (
                <>
                  <div><label className={labelCls}>Name</label><input className={inputCls} value={formData.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div><label className={labelCls}>Email</label><input className={inputCls} value={formData.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><label className={labelCls}>Phone</label><input className={inputCls} value={formData.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>Role</label><input className={inputCls} placeholder="Manager, Associate…" value={formData.role ?? ''} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} /></div>
                    <div><label className={labelCls}>Department</label><input className={inputCls} value={formData.department ?? ''} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} /></div>
                  </div>
                </>
              )}
              {error && <p className="text-[0.72rem] text-red-500">{error}</p>}
            </div>
            <div className="px-6 pb-5 flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="text-[0.65rem] font-mono uppercase tracking-wider px-4 py-2 rounded border border-gray-200 text-gray-500 hover:border-gray-400 transition-colors">Cancel</button>
              <button
                onClick={() => handleAction(modal.type, modal.convId, formData)}
                disabled={busy}
                className="text-[0.65rem] font-mono uppercase tracking-wider px-4 py-2 rounded bg-[#f26a1b] text-white hover:bg-[#f58140] disabled:opacity-50 transition-colors"
              >
                {busy ? 'Saving…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
