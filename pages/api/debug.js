import { getCategories } from '../../lib/sheets'

export default async function handler(req, res) {
  try {
    const categories = await getCategories()
    res.status(200).json({ ok: true, count: categories.length, categories })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
}
