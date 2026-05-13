import { getProducts } from '../../lib/sheets'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()
  const { brandId } = req.query
  try {
    const products = await getProducts(brandId)
    res.status(200).json(products)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '無法取得產品資料' })
  }
}
