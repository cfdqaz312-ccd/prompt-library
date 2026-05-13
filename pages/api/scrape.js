import { autoClassify, detectVariables } from '../../lib/categorizer'

// 從 URL 中擷取乾淨的貼文網址（去掉 query string）
function cleanUrl(url) {
  try {
    const u = new URL(url)
    return `${u.origin}${u.pathname}`
  } catch {
    return url
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { url } = req.body
  if (!url || (!url.includes('threads.net') && !url.includes('threads.com'))) {
    return res.status(400).json({ error: '請提供有效的 Threads 網址' })
  }

  const postUrl = cleanUrl(url)

  try {
    // 方法一：試 oEmbed API（官方支援，不需登入，公開貼文可用）
    const oembedUrl = `https://www.threads.net/oembed/?url=${encodeURIComponent(postUrl)}`
    const oembedRes = await fetch(oembedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })

    if (oembedRes.ok) {
      const data = await oembedRes.json()
      // oEmbed 回傳的 html 欄位含有貼文內容，從中提取文字
      let content = ''
      if (data.html) {
        // 去除 HTML 標籤
        content = data.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        // 去掉結尾的作者/來源資訊（通常在 — 後面）
        content = content.split('—')[0].trim()
      }
      if (!content && data.title) {
        content = data.title
      }
      if (content) {
        const { type, subcategory } = autoClassify(content)
        return res.status(200).json({
          content,
          type,
          subcategory,
          hasVariables: detectVariables(content).length > 0,
          source: postUrl,
        })
      }
    }

    // 方法二：直接抓 HTML，從 meta og:description 取得
    const cheerio = await import('cheerio')
    const htmlRes = await fetch(postUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
      },
    })

    if (htmlRes.ok) {
      const html = await htmlRes.text()
      const $ = cheerio.load(html)
      const content =
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        ''

      if (content) {
        const { type, subcategory } = autoClassify(content)
        return res.status(200).json({
          content,
          type,
          subcategory,
          hasVariables: detectVariables(content).length > 0,
          source: postUrl,
        })
      }
    }

    // 都失敗了
    return res.status(400).json({
      error: '無法自動擷取內容（Threads 限制），請直接複製貼文文字後手動貼上',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '爬取失敗，請手動複製內容後貼上' })
  }
}
