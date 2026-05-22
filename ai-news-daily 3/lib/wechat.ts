import { DailyReport, CATEGORY_CONFIG } from './types'

export async function sendWechatPush(report: DailyReport): Promise<void> {
  const token = process.env.WXPUSHER_APP_TOKEN
  const topicId = process.env.WXPUSHER_TOPIC_ID
  if (!token || !topicId) return

  const top3 = report.items.slice(0, 3)
  const content = top3.map((item, i) => {
    const cat = CATEGORY_CONFIG[item.category]?.label || ''
    return `${i + 1}. 【${cat}】${item.title}\n${item.body.slice(0, 60)}...\n⚡ ${item.actionable}`
  }).join('\n\n')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const summary = `📡 AI创作者情报 ${report.date}\n\n${report.summary}\n\n${content}\n\n🔗 查看完整报告：${siteUrl}/report/${report.date}`

  await fetch('https://wxpusher.zjiecode.com/api/send/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appToken: token,
      content: summary,
      summary: `AI创作情报 ${report.date}`,
      contentType: 1,
      topicIds: [parseInt(topicId)],
      url: `${siteUrl}/report/${report.date}`,
    })
  })
}
