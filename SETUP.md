# Prompt Library 部署說明

## 步驟一：建立 Google Sheets

1. 開啟 Google Sheets，建立一個新的試算表
2. 將試算表重新命名（例如：Prompt Library）
3. 建立以下 **5 個工作表**（在底部分頁點「+」新增）：

---

### 工作表 1：Prompts（已上線指令）

| 欄位（第一列請照這個順序填） |
|---|
| A: ID（系統自動生成，不需手動填）|
| B: 名稱 |
| C: 類型（圖片 或 文案）|
| D: 子分類 |
| E: 適用品牌（品牌ID，多個用逗號分隔；共用請填 ALL）|
| F: Prompt內容 |
| G: 有無變數（TRUE 或 FALSE）|
| H: 狀態（approved）|
| I: 來源（manual 或 Threads網址）|
| J: 提交者 |
| K: 建立日期 |
| L: 備注 |

---

### 工作表 2：Brands（品牌資料）

| 欄位 |
|---|
| A: 品牌ID（英文，不含空格，例：brand_a）|
| B: 品牌名稱（中文）|
| C: 色調描述（例：溫暖橘色調、鮮豔高飽和）|
| D: 風格關鍵字（例：簡約、時尚、年輕）|
| E: 語氣描述（例：輕鬆活潑、專業正式）|
| F: 常用尺寸（例：1080x1080）|
| G: 自訂變數1名稱（例：品牌標語）|
| H: 自訂變數1值（例：Just Do It）|
| I: 自訂變數2名稱 |
| J: 自訂變數2值 |

**範例資料：**
```
brand_a | A品牌 | 清新藍白色調 | 簡約、信賴、專業 | 親切但不失專業 | 1080x1080 | | | |
brand_b | B品牌 | 活潑橘色系 | 年輕、活力、趣味 | 輕鬆活潑 | 1080x1080 | | | |
```

---

### 工作表 3：Products（產品標籤）

| 欄位 |
|---|
| A: 產品ID（英文，例：prod_001）|
| B: 所屬品牌ID（對應 Brands 的 A 欄）|
| C: 產品名稱 |
| D: 產品描述 |
| E: 產品特色 |

---

### 工作表 4：Pending（待審核）

與 Prompts 相同欄位，**不需手動填寫**，系統會自動寫入。

---

### 工作表 5：Categories（分類設定）

| 欄位 |
|---|
| A: 類型（圖片 或 文案）|
| B: 子分類名稱 |
| C: 說明（選填）|

**預設填入：**
```
圖片 | 尺寸／比例調整 |
圖片 | 去背／背景移除 |
圖片 | 背景生成 |
圖片 | 元素提取 |
圖片 | 風格轉換 |
圖片 | 品牌化 |
文案 | 廣告文案 |
文案 | 社群貼文 |
文案 | 公告／通知 |
文案 | 產品描述 |
文案 | 活動文案 |
```

---

## 步驟二：設定 Google Sheets API

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 建立新專案（或選現有專案）
3. 左側選單 → **API 和服務** → **啟用 API**
4. 搜尋 **Google Sheets API** → 啟用
5. 左側 → **憑證** → **建立憑證** → **服務帳戶**
6. 填入名稱（例：prompt-library-service），建立完成
7. 點進剛建立的服務帳戶 → **金鑰** → **新增金鑰** → **JSON**
8. 下載 JSON 檔案，找到以下兩個值：
   - `client_email`（這是 GOOGLE_SERVICE_ACCOUNT_EMAIL）
   - `private_key`（這是 GOOGLE_PRIVATE_KEY）

9. 回到 Google Sheets，點右上角**分享**，將上面的 `client_email` 加入，給予**編輯者**權限

10. 複製試算表網址中的 ID（網址中 `/d/` 和 `/edit` 之間的那串字）
    - 例：`https://docs.google.com/spreadsheets/d/【這段就是ID】/edit`

---

## 步驟三：部署到 Vercel

1. 前往 [GitHub](https://github.com) 建立新的 repository（免費帳號即可）
2. 把這個 `prompt-library` 資料夾上傳到 GitHub
   - 方法：GitHub 網頁版 → 新 repository → 上傳檔案
3. 前往 [Vercel](https://vercel.com)，用 GitHub 帳號登入（免費）
4. **New Project** → 選剛剛的 repository → **Deploy**
5. 部署完成前，先設定環境變數：
   - 在 Vercel 專案 → **Settings** → **Environment Variables**
   - 新增以下四個變數：

| 變數名稱 | 值 |
|---|---|
| GOOGLE_SERVICE_ACCOUNT_EMAIL | 步驟二取得的 client_email |
| GOOGLE_PRIVATE_KEY | 步驟二取得的 private_key（完整貼上，包含 -----BEGIN...）|
| GOOGLE_SHEET_ID | 步驟二取得的試算表 ID |
| ADMIN_PASSWORD | 自訂一個管理員密碼 |

6. 回到 **Deployments** → **Redeploy**（讓環境變數生效）
7. 完成！Vercel 會給你一個免費網址，例如 `https://prompt-library-xxx.vercel.app`

---

## 日常維護

| 想做什麼 | 怎麼做 |
|---|---|
| 新增品牌 | 在 Sheets「Brands」工作表加一列 |
| 新增產品 | 在 Sheets「Products」工作表加一列 |
| 新增分類 | 在 Sheets「Categories」工作表加一列 |
| 審核新指令 | 進網站 → 待審核 → 輸入密碼 |
| 下架指令 | 在 Sheets「Prompts」工作表找到該列，將 H 欄改為 archived |
| 直接新增指令（跳過審核）| 直接在 Sheets「Prompts」工作表填入資料 |

---

## Prompt 變數說明

在 Prompt 內容中，用 `{變數名稱}` 格式標記變數，系統會自動偵測並提供填入介面。

**預設支援的變數：**
- `{品牌名稱}` → 自動帶入品牌名稱
- `{品牌色調}` → 自動帶入 Brands 表的「色調描述」
- `{品牌風格}` → 自動帶入 Brands 表的「風格關鍵字」
- `{品牌語氣}` → 自動帶入 Brands 表的「語氣描述」
- `{產品名稱}` → 需手動選擇產品
- `{產品描述}` → 需手動選擇產品
- `{產品特色}` → 需手動選擇產品

**範例：**
```
請為 {品牌名稱} 製作一張廣告圖，風格為 {品牌風格}，
主打產品是 {產品名稱}：{產品特色}
色調參考：{品牌色調}
```
