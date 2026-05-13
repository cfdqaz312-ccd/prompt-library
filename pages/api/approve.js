import { approvePrompt } from '../../lib/sheets'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id, password } = req.body
  const adminPw = process.env.ADMIN_PASSWORD?.replace(/^﻿/, '').trim()
  if (password !== adminPw) {
    return res.status(401).json({ error: '密碼錯誤' })
  }
  try {
    await approvePrompt(id)
    res.status(200).json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '批准失敗' })
  }
}
