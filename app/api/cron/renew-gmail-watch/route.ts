import { NextRequest, NextResponse } from 'next/server'
import { registerGmailWatch } from '@/lib/gmail'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const topic = process.env.GMAIL_PUBSUB_TOPIC
  if (!topic) {
    return NextResponse.json({ ok: false, error: 'GMAIL_PUBSUB_TOPIC not set' }, { status: 500 })
  }

  try {
    const watch = await registerGmailWatch(topic)

    await supabaseAdmin
      .from('maia_watch_state')
      .upsert({
        id:              1,
        last_history_id: watch.historyId,
        watch_expiry:    new Date(Number(watch.expiration)).toISOString(),
        updated_at:      new Date().toISOString(),
      })

    console.log('[cron] Gmail watch renewed:', watch.historyId)
    return NextResponse.json({
      ok:        true,
      historyId: watch.historyId,
      expiry:    new Date(Number(watch.expiration)).toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[cron] Gmail watch renewal failed:', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
