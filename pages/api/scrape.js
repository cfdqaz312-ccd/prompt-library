import { autoClassify, detectVariables } from '../../lib/categorizer'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { url } = req.body
  if (!url || !url.includes('threads.net')) {
    return res.status(400).json({ error: '請提供有效的 Threads 網址' })
  }

  try {
    // 動態 import cheerio（避免 edge runtime 問題）
    const cheerio = await import('cheerio')

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
      },
    })

    if (!response.ok) {
      return res.status(400).json({ error: '無法存取此 Threads 貼文，請確認網址是否正確或貼文是否公開' })
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // 嘗試從 meta 標籤取得內容（Threads 通常會有 og:description）
    let content = $('meta[property="og:description"]').attr('content') || ''

    // 備用：嘗試從頁面文字抓取
    if (!content) {
      content = $('[data-pressable-container] span').first().text()
    }

    if (!content) {
      return res.status(400).json({ error: '無法擷取貼文內容，可能需要登入或貼文不公開' })
    }

    // 清理多餘文字
    content = content.replace(/^.*?(prompt|指令|：|:)/i, '').trim() || content

    const { type, subcategory } = autoClassify(content)
    const hasVariables = detectVariables(content).length > 0

    res.status(200).json({
      content,
      type,
      subcategory,
      hasVariables,
      source: url,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '爬取失敗，請手動複製內容後貼上' })
  }
}
