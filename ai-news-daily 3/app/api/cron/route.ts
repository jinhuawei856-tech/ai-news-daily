import { NextRequest, NextResponse } from 'next/server'
import { fetchAINews } from '@/lib/claude'
import { sendDailyReport, sendAdminAlert } from '@/lib/email'
import { sendWechatPush } from '@/lib/wechat'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 300 // 5 minutes

export async function GET(req: NextRequest) {
  // Security: verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const db = supabaseAdmin()

  try {
    // 1. Check if today's report already exists (idempotency)
    const { data: existing } = await db
      .from('reports')
      .select('id')
      .eq('date', today)
      .single()

    if (existing) {
      return NextResponse.json({ message: 'Report already exists for today', date: today })
    }

    // 2. Fetch news from Claude + web search
    console.log('[CRON] Fetching news from Claude...')
    const { items, summary } = await fetchAINews()

    // 3. Save report to Supabase
    const { data: report, error: dbError } = await db
      .from('reports')
      .insert({ date: today, items, summary })
      .select()
      .single()

    if (dbError || !report) throw new Error(`DB insert failed: ${dbError?.message}`)
    console.log(`[CRON] Saved report with ${items.length} items`)

    // 4. Get active subscribers
    const { data: subscribers } = await db
      .from('subscribers')
      .select('email, token')
      .eq('status', 'active')

    const subs = subscribers || []
    console.log(`[CRON] Sending to ${subs.length} subscribers`)

    // 5. Send emails
    const emailResult = await sendDailyReport(report, subs)
    console.log(`[CRON] Email: sent=${emailResult.sent}, failed=${emailResult.failed}`)

    // 6. WeChat push (optional)
    await sendWechatPush(report).catch(e => console.error('[CRON] WeChat push failed:', e))

    // 7. Alert admin if many failures
    if (emailResult.failed > emailResult.sent * 0.1) {
      await sendAdminAlert(
        '邮件发送异常',
        `今日报告发送完成，但失败率偏高。成功：${emailResult.sent}，失败：${emailResult.failed}`
      )
    }

    return NextResponse.json({
      success: true,
      date: today,
      itemCount: items.length,
      subscribers: subs.length,
      emailSent: emailResult.sent,
      emailFailed: emailResult.failed,
    })

  } catch (err: any) {
    console.error('[CRON] Fatal error:', err)
    await sendAdminAlert('每日任务执行失败', `错误详情：\n${err.message}\n\n${err.stack || ''}`)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
