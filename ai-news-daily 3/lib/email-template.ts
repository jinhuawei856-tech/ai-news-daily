import { DailyReport, NewsItem, CATEGORY_CONFIG, IMPACT_CONFIG } from './types'

function newsCard(item: NewsItem): string {
  const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.tool
  const imp = IMPACT_CONFIG[item.impact]
  return `
  <div style="background:#ffffff;border:1px solid #e8e8e8;border-radius:12px;padding:20px 24px;margin-bottom:12px;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
      <span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;background:${cat.bg};color:${cat.color};border:1px solid ${cat.border};">${cat.label}</span>
      <span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;background:${imp.bg};color:${imp.color};">${imp.label}</span>
      <span style="font-size:11px;color:#999;margin-left:auto;">${item.source}</span>
    </div>
    <h3 style="margin:0 0 8px;font-size:15px;font-weight:600;color:#1a1a1a;line-height:1.4;">${item.title}</h3>
    <p style="margin:0 0 12px;font-size:13px;color:#555;line-height:1.7;">${item.body}</p>
    ${item.actionable ? `
    <div style="background:#f0faf5;border-left:3px solid #1D9E75;padding:8px 12px;border-radius:0 6px 6px 0;">
      <span style="font-size:12px;color:#085041;"><strong>⚡ 立即行动：</strong>${item.actionable}</span>
    </div>` : ''}
    ${item.tags?.length ? `
    <div style="margin-top:10px;">
      ${item.tags.map(t => `<span style="font-size:11px;color:#888;background:#f5f5f5;padding:2px 8px;border-radius:4px;margin-right:4px;">#${t}</span>`).join('')}
    </div>` : ''}
  </div>`
}

export function buildEmailHTML(report: DailyReport, unsubToken: string, siteUrl: string): string {
  const dateStr = new Date(report.date).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  })
  const highItems = report.items.filter(i => i.impact === 'high')
  const otherItems = report.items.filter(i => i.impact !== 'high')
  const unsubUrl = `${siteUrl}/unsubscribe?token=${unsubToken}`
  const reportUrl = `${siteUrl}/report/${report.date}`

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI 创作者情报局 · ${dateStr}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:#0f0f0f;border-radius:16px 16px 0 0;padding:32px 32px 24px;">
    <p style="margin:0 0 4px;font-size:11px;color:#666;letter-spacing:2px;text-transform:uppercase;">AI CREATOR INTELLIGENCE</p>
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#ffffff;line-height:1.2;">AI 创作者情报局</h1>
    <p style="margin:0;font-size:13px;color:#888;">${dateStr}</p>
  </td></tr>

  <!-- Summary Banner -->
  <tr><td style="background:#1D9E75;padding:16px 32px;">
    <p style="margin:0;font-size:14px;color:#ffffff;line-height:1.5;">
      <strong>今日速览：</strong>${report.summary}
    </p>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#fafaf8;padding:24px 32px 8px;">
    <p style="margin:0 0 4px;font-size:11px;color:#999;letter-spacing:1px;">HIGH IMPACT · 重点关注</p>
    <h2 style="margin:0 0 16px;font-size:14px;font-weight:600;color:#1a1a1a;">今日重点动态</h2>
    ${highItems.map(newsCard).join('')}

    ${otherItems.length ? `
    <p style="margin:24px 0 4px;font-size:11px;color:#999;letter-spacing:1px;">MORE NEWS · 更多资讯</p>
    <h2 style="margin:0 0 16px;font-size:14px;font-weight:600;color:#1a1a1a;">其他值得关注</h2>
    ${otherItems.map(newsCard).join('')}` : ''}
  </td></tr>

  <!-- CTA -->
  <tr><td style="background:#fafaf8;padding:8px 32px 32px;text-align:center;">
    <a href="${reportUrl}" style="display:inline-block;background:#0f0f0f;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:500;">查看完整网页版 →</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f0efe8;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
    <p style="margin:0 0 6px;font-size:12px;color:#999;">
      你收到此邮件是因为订阅了 AI 创作者情报局每日简报
    </p>
    <p style="margin:0;font-size:12px;color:#999;">
      <a href="${unsubUrl}" style="color:#999;text-decoration:underline;">取消订阅</a>
      &nbsp;·&nbsp;
      <a href="${siteUrl}" style="color:#999;text-decoration:underline;">访问网站</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function buildEmailText(report: DailyReport): string {
  const lines = [`AI 创作者情报局 · ${report.date}`, `今日速览：${report.summary}`, '']
  for (const item of report.items) {
    lines.push(`[${CATEGORY_CONFIG[item.category]?.label}] ${item.title}`)
    lines.push(item.body)
    if (item.actionable) lines.push(`⚡ 立即行动：${item.actionable}`)
    lines.push('')
  }
  return lines.join('\n')
}
