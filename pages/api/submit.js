import { submitPrompt } from '../../lib/sheets'
import { detectVariables } from '../../lib/categorizer'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { name, type, subcategory, brands, content, source, submittedBy, notes } = req.body
  if (!name || !type || !content) {
    return res.status(400).json({ error: '請填寫名稱、類型與 Prompt 內容' })
  }
  const hasVariables = detectVariables(content).length > 0
  try {
    const id = await submitPrompt({ name, type, subcategory, brands, content, hasVariables, source, submittedBy, notes })
    res.status(200).json({ success: true, id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '提交失敗，請稍後再試' })
  }
}
