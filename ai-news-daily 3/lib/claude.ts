import Anthropic from '@anthropic-ai/sdk'
import { NewsItem } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `你是一名专业的 AI 内容创作行业分析师，负责为 AI 创作者社群提供每日全球资讯简报。

输出要求：
- 返回 JSON 数组，包含 8~10 条资讯条目
- 每条必须字段：
  {
    "title": "资讯标题（15字以内，简洁有力）",
    "body": "内容摘要（80~120字，说清楚事件背景+对创作者的影响分析）",
    "category": "tool|platform|method|copyright|biz|viral 之一",
    "impact": "high|medium|low（对创作者的影响程度）",
    "source": "来源名称（如 OpenAI官方、TechCrunch、36氪等）",
    "actionable": "创作者可以立刻做的1个行动（20字以内）",
    "tags": ["关键词1", "关键词2", "关键词3"]
  }
- 6个 category 分布：tool/platform/method/copyright/biz 各至少1条，viral至少1条
- 优先选取过去 72 小时内发生的真实事件
- 只返回 JSON 数组，不含任何其他文字、解释或 markdown 代码块`

const USER_PROMPT = `请搜索今日全球 AI 内容创作行业最新资讯，涵盖以下6个维度：

1. **创作工具（category: tool）**
   Seedance、Midjourney、Veo 3、Kling/可灵、ComfyUI、Tapnow、Higgsfield、Runway、Sora、Luma Dream Machine 等工具的新功能、版本更新、重大突破

2. **平台动态（category: platform）**
   抖音、小红书、B站、YouTube、TikTok 等平台的 AI 内容政策、流量规则、创作者扶持计划、AI 标注规范变化

3. **创作方式（category: method）**
   AI 视频、图像、音乐、多模态内容的新技术、新工作流、新创作范式，以及有影响力的教程或方法论

4. **版权合规（category: copyright）**
   全球 AI 版权法规进展、平台内容标注规则、IP 授权动态、AI 训练数据版权争议、重大诉讼案例

5. **商业化与发行（category: biz）**
   创作者变现新模式、MCN 机构动态、AI 内容授权交易、品牌 AI 合作案例、创作者经济趋势报告

6. **全球爆款 AI 内容（category: viral）**
   近期在全球范围内爆火的 AI 生成内容/动画/短片，包含具体数据（播放量/点赞数），分析其爆火原因`

export async function fetchAINews(): Promise<{ items: NewsItem[]; summary: string }> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    tools: [{ type: 'web_search_20250305' as any, name: 'web_search' }],
    messages: [{ role: 'user', content: USER_PROMPT }],
  })

  // Extract text from all content blocks (including after tool use)
  const textBlocks = response.content.filter(b => b.type === 'text').map(b => (b as any).text)
  const fullText = textBlocks.join('')

  // Parse JSON array
  const startIdx = fullText.indexOf('[')
  const endIdx = fullText.lastIndexOf(']')
  if (startIdx === -1 || endIdx === -1) throw new Error('No JSON array in Claude response')

  const raw = fullText.slice(startIdx, endIdx + 1).replace(/```json|```/g, '').trim()
  const items: NewsItem[] = JSON.parse(raw)

  // Sort by impact: high → medium → low
  const impactOrder = { high: 0, medium: 1, low: 2 }
  items.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact])

  // Generate summary from top high-impact item
  const topItem = items.find(i => i.impact === 'high') || items[0]
  const summary = topItem ? `今日头条：${topItem.title}` : `今日收录 ${items.length} 条 AI 创作行业动态`

  return { items, summary }
}
