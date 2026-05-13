import { getApprovedPrompts, getPromptById } from '../../lib/sheets'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { brandId, id } = req.query
  try {
    if (id) {
      const prompt = await getPromptById(id)
      if (!prompt) return res.status(404).json({ error: '找不到指令' })
      return res.status(200).json(prompt)
    }
    const prompts = await getApprovedPrompts(brandId)
    res.status(200).json(prompts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '無法取得指令資料' })
  }
}
