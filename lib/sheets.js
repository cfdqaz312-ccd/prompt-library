import { google } from 'googleapis'

const SHEET_ID = process.env.GOOGLE_SHEET_ID

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

function getSheetsClient() {
  return google.sheets({ version: 'v4', auth: getAuth() })
}

// 將一列資料轉換成物件
function rowToPrompt(row, index) {
  return {
    id: row[0] || `row_${index}`,
    name: row[1] || '',
    type: row[2] || '',
    subcategory: row[3] || '',
    brands: row[4] ? row[4].split(',').map(b => b.trim()) : ['ALL'],
    content: row[5] || '',
    hasVariables: row[6] === 'TRUE',
    status: row[7] || 'approved',
    source: row[8] || 'manual',
    submittedBy: row[9] || '',
    createdAt: row[10] || '',
    notes: row[11] || '',
  }
}

function rowToBrand(row) {
  return {
    id: row[0] || '',
    name: row[1] || '',
    colorDescription: row[2] || '',
    styleKeywords: row[3] || '',
    toneDescription: row[4] || '',
    commonSizes: row[5] || '',
    customVar1Label: row[6] || '',
    customVar1Value: row[7] || '',
    customVar2Label: row[8] || '',
    customVar2Value: row[9] || '',
  }
}

function rowToProduct(row) {
  return {
    id: row[0] || '',
    brandId: row[1] || '',
    name: row[2] || '',
    description: row[3] || '',
    features: row[4] || '',
  }
}

export async function getBrands() {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Brands!A2:J',
  })
  return (res.data.values || []).map(rowToBrand).filter(b => b.id)
}

export async function getProducts(brandId) {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Products!A2:E',
  })
  const all = (res.data.values || []).map(rowToProduct).filter(p => p.id)
  return brandId ? all.filter(p => p.brandId === brandId) : all
}

export async function getApprovedPrompts(brandId) {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Prompts!A2:L',
  })
  const all = (res.data.values || []).map(rowToPrompt).filter(p => p.id && p.status === 'approved')
  if (!brandId) return all
  return all.filter(p => p.brands.includes('ALL') || p.brands.includes(brandId))
}

export async function getPromptById(id) {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Prompts!A2:L',
  })
  const all = (res.data.values || []).map(rowToPrompt)
  return all.find(p => p.id === id) || null
}

export async function getPendingPrompts() {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Pending!A2:L',
  })
  return (res.data.values || []).map((row, i) => rowToPrompt(row, i)).filter(p => p.name)
}

export async function submitPrompt(data) {
  const sheets = getSheetsClient()
  const id = `pending_${Date.now()}`
  const row = [
    id,
    data.name,
    data.type,
    data.subcategory,
    Array.isArray(data.brands) ? data.brands.join(',') : data.brands,
    data.content,
    data.hasVariables ? 'TRUE' : 'FALSE',
    'pending',
    data.source || 'manual',
    data.submittedBy || '',
    new Date().toISOString().split('T')[0],
    data.notes || '',
  ]
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Pending!A:L',
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  })
  return id
}

export async function approvePrompt(pendingId) {
  const sheets = getSheetsClient()

  // 從 Pending 找到這筆資料
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Pending!A2:L',
  })
  const rows = res.data.values || []
  const rowIndex = rows.findIndex(r => r[0] === pendingId)
  if (rowIndex === -1) throw new Error('找不到待審核指令')

  const row = [...rows[rowIndex]]
  row[7] = 'approved'

  // 新增到 Prompts
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Prompts!A:L',
    valueInputOption: 'RAW',
    requestBody: { values: [row] },
  })

  // 從 Pending 刪除（清空該列）
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `Pending!A${rowIndex + 2}:L${rowIndex + 2}`,
  })
}

export async function rejectPrompt(pendingId, reason) {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Pending!A2:L',
  })
  const rows = res.data.values || []
  const rowIndex = rows.findIndex(r => r[0] === pendingId)
  if (rowIndex === -1) throw new Error('找不到待審核指令')

  // 在備注欄加上退回原因
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Pending!H${rowIndex + 2}:L${rowIndex + 2}`,
    valueInputOption: 'RAW',
    requestBody: { values: [['rejected', '', '', '', `退回原因：${reason}`]] },
  })
}

export async function getCategories() {
  const sheets = getSheetsClient()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Categories!A2:C',
  })
  return (res.data.values || [])
    .filter(r => r[0])
    .map(r => ({ type: r[0], subcategory: r[1], description: r[2] || '' }))
}
