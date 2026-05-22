import { Resend } from 'resend'
import { DailyReport } from './types'
import { buildEmailHTML, buildEmailText } from './email-template'

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendWithRetry(fn: () => Promise<any>, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(r => setTimeout(r, 2000 * (i + 1)))
    }
  }
}

export async function sendDailyReport(
  report: DailyReport,
  subscribers: { email: string; token: string }[]
): Promise<{ sent: number; failed: number }> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
  const from = `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`
  const subject = `AI 创作者情报 ${report.date} · ${report.summary.slice(0, 20)}...`

  let sent = 0
  let failed = 0

  // Send in batches of 50 to avoid rate limits
  const BATCH = 50
  for (let i = 0; i < subscribers.length; i += BATCH) {
    const batch = subscribers.slice(i, i + BATCH)
    await Promise.all(batch.map(async (sub) => {
      const html = buildEmailHTML(report, sub.token, siteUrl)
      const text = buildEmailText(report)
      try {
        await sendWithRetry(() =>
          resend.emails.send({ from, to: sub.email, subject, html, text })
        )
        sent++
      } catch {
        failed++
      }
    }))
    if (i + BATCH < subscribers.length) {
      await new Promise(r => setTimeout(r, 1000)) // rate limit pause
    }
  }
  return { sent, failed }
}

export async function sendConfirmEmail(email: string, token: string): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
  const confirmUrl = `${siteUrl}/api/subscribe/confirm?token=${token}`
  await sendWithRetry(() =>
    resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '确认订阅 AI 创作者情报局',
      html: `
      <div style="font-family:sans-serif;max-width:480px;margin:40px auto;padding:32px;background:#fafaf8;border-radius:12px;border:1px solid #e8e8e8;">
        <h2 style="margin:0 0 12px;font-size:20px;color:#0f0f0f;">确认你的订阅</h2>
        <p style="color:#555;line-height:1.6;">点击下方按钮，完成订阅 AI 创作者情报局每日简报。</p>
        <a href="${confirmUrl}" style="display:inline-block;background:#0f0f0f;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:500;margin:16px 0;">确认订阅</a>
        <p style="font-size:12px;color:#999;margin-top:16px;">如果你没有请求此订阅，忽略此邮件即可。</p>
      </div>`,
      text: `确认订阅 AI 创作者情报局：${confirmUrl}`
    })
  )
}

export async function sendAdminAlert(subject: string, body: string): Promise<void> {
  if (!process.env.ADMIN_EMAIL) return
  await resend.emails.send({
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `[AI情报局告警] ${subject}`,
    text: body,
  }).catch(() => {}) // silent fail for admin alerts
}
