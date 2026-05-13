// 關鍵字規則自動分類（免費，約 7-8 成準確度）
const IMAGE_KEYWORDS = ['圖片', '圖像', '尺寸', '去背', '背景', '元素', '風格', '顏色', '色調', '濾鏡', '畫面', 'image', 'photo', 'background', 'style', 'color', 'size', 'crop', 'resize', 'remove', 'generate', '生成', '製作圖', '廣告圖', '素材']
const COPY_KEYWORDS = ['文案', '文字', '標題', '廣告詞', '貼文', '公告', '通知', '描述', 'copy', 'text', 'headline', 'caption', 'post', 'announcement', 'description', 'slogan', '口號', '活動']

const SUBCATEGORY_RULES = [
  { keywords: ['尺寸', 'resize', 'size', '比例', 'crop'], type: '圖片', subcategory: '尺寸／比例調整' },
  { keywords: ['去背', 'remove background', 'background removal', '移除背景'], type: '圖片', subcategory: '去背／背景移除' },
  { keywords: ['背景生成', 'background generate', '生成背景', '替換背景'], type: '圖片', subcategory: '背景生成' },
  { keywords: ['提取元素', '元素提取', 'extract element'], type: '圖片', subcategory: '元素提取' },
  { keywords: ['風格轉換', 'style transfer', '風格化'], type: '圖片', subcategory: '風格轉換' },
  { keywords: ['品牌化', '品牌風格', 'brand style', '加入品牌'], type: '圖片', subcategory: '品牌化' },
  { keywords: ['廣告文案', '廣告詞', 'ad copy', 'advertisement'], type: '文案', subcategory: '廣告文案' },
  { keywords: ['IG', 'Instagram', 'FB', 'Facebook', 'Threads', '社群', '貼文', 'post', 'caption'], type: '文案', subcategory: '社群貼文' },
  { keywords: ['公告', '通知', 'announcement', 'notice'], type: '文案', subcategory: '公告／通知' },
  { keywords: ['產品描述', '商品描述', 'product description'], type: '文案', subcategory: '產品描述' },
  { keywords: ['活動', 'event', '促銷', 'promotion', '優惠'], type: '文案', subcategory: '活動文案' },
]

export function autoClassify(text) {
  const lower = text.toLowerCase()

  // 判斷主類型
  const imageScore = IMAGE_KEYWORDS.filter(k => lower.includes(k.toLowerCase())).length
  const copyScore = COPY_KEYWORDS.filter(k => lower.includes(k.toLowerCase())).length
  const type = imageScore >= copyScore ? '圖片' : '文案'

  // 判斷子分類
  let subcategory = type === '圖片' ? '其他圖片' : '其他文案'
  for (const rule of SUBCATEGORY_RULES) {
    if (rule.type === type && rule.keywords.some(k => lower.includes(k.toLowerCase()))) {
      subcategory = rule.subcategory
      break
    }
  }

  return { type, subcategory }
}

// 從文字中偵測是否包含變數（{變數名稱} 格式）
export function detectVariables(content) {
  const matches = content.match(/\{([^}]+)\}/g)
  return matches ? matches.map(m => m.slice(1, -1)) : []
}
