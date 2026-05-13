import { getCategories } from '../../lib/sheets'

export default async function handler(req, res) {
  const sheetId = process.env.GOOGLE_SHEET_ID || '(missing)'
  const hasCredentials = !!process.env.GOOGLE_CREDENTIALS_JSON
  const credLength = process.env.GOOGLE_CREDENTIALS_JSON?.length || 0

  // 嘗試解碼 credentials 看是否正常
  let credEmail = '(decode failed)'
  try {
    const decoded = JSON.parse(
      Buffer.from(process.env.GOOGLE_CREDENTIALS_JSON, 'base64').toString('utf8')
    )
    credEmail = decoded.client_email || '(no email)'
  } catch (e) {
    credEmail = `(error: ${e.message})`
  }

  try {
    const categories = await getCategories()
    res.status(200).json({
      ok: true,
      count: categories.length,
      sheetId,
      credEmail,
    })
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
      sheetId,
      hasCredentials,
      credLength,
      credEmail,
    })
  }
}
