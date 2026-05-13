import { getPendingPrompts } from '../../lib/sheets'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { password } = req.query
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '密碼錯誤' })
  }
  try {
    const prompts = await getPendingPrompts()
    res.status(200).json(prompts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '無法取得待審核資料' })
  }
}
