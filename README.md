# 望龍埤行前指南

獨立、非營利的旅遊與文化資訊網站。保留Astro server、Cloudflare adapter、預先生成首頁與動態 `/api/weather`。

使用package.json指定的Node版本及直接依賴。既有Cloudflare流程實際以Bun安裝，再執行 `npm run build` 與 `npx wrangler deploy`。本專案加入由Bun 1.2.15正常解析產生的bun.lock；未加入pnpm鎖檔或更改自動安裝設定。重現安裝使用 `bun install --frozen-lockfile`，再執行 `npm run check`、`npm run build`、`npm run verify`。

部署前核實生成的Worker入口、ASSETS目錄、既有SESSION/IMAGES繫結及實際平台成功結果；本地檢查不是生產驗收。

景點資料與開放時間引用宜蘭縣政府精確景點頁，店家、公車、停車與無障礙狀況有各自範圍。Google Maps僅為有日期的第三方評分快照。

Open-Meteo提供模型預報，頁面列明來源、CC BY 4.0與模型來源。免費API限非商業用途；本指南不提供廣告、訂閱、訂房或付款。API快取有明確時效和較早資料標記，過期或失敗時不把舊資料冒充即時天氣。

四張既有照片保持原始位元組與各自的Commons來源；每處展示有作者、日期、來源及授權。圖片許可不等於遊客肖像或場所入場許可，並未聲稱取得額外授權。
