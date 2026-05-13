import { getBrands } from '../../lib/sheets'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const brands = await getBrands()
    res.status(200).json(brands)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '無法取得品牌資料' })
  }
}
