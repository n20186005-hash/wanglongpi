# 望龍埤｜宜蘭員山景點單頁網站

為宜蘭縣員山鄉望龍埤設計的單頁旅遊網站。視覺以湖色、朱橋、山霧為主題，不使用通用景點模板。

## 技術棧

- Astro 7.3.2
- Tailwind CSS 4.3.3（`@tailwindcss/vite` 4.3.3）
- TypeScript 6.0.3
- `@astrojs/cloudflare` 14.3.1
- `@astrojs/sitemap` 3.7.4
- `@astrojs/check` 0.9.10
- Wrangler 4.131.2
- pnpm 12.4.1
- Node.js 24.21.0 LTS

所有套件版本均以精確版本寫入 `package.json`；Node 與 pnpm 亦由 `.node-version`、`engines` 與 `packageManager` 固定。

## 網域設定

網域只在 `astro.config.ts` 的 `SITE_URL` 設定一次：

```ts
const SITE_URL = '';
```

留空時專案仍可建置：canonical、`og:url`、絕對 OG image URL、JSON-LD `url` 與 sitemap 會自動省略或停用，不會回退到任何占位網域。網域確定後只需填入 `SITE_URL` 並重新建置。

## 常用指令

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm preview
pnpm deploy
```

Cloudflare Worker 由 `wrangler.jsonc` 與 `@astrojs/cloudflare` adapter 配置。專案是單包結構，因此未建立 `pnpm-workspace.yaml`。

## 圖片與授權

Logo、favicon 與 OG cover 均為專案本地資產。頁面實景照片使用 Wikimedia Commons 上的望龍埤真實照片，來源與授權詳見 `CREDITS.md`。實景照片目前保留 Commons 原圖 URL，以避免在無法可靠下載原始二進位檔的執行環境中產生損壞或假照片；若要完全本地化，可依 `CREDITS.md` 的原圖連結下載至 `public/images/` 後替換四個照片 URL 與 `global.css` 的 hero 背景 URL。

## 內容來源

主要景點資料以宜蘭縣政府旅遊網公開資訊為基礎；公車路線以宜蘭勁好行綠16公開路線資訊為依據。容易變動的公車班次、停車收費與店家營業狀態，頁面均提示以當日公告為準。

## SEO / 結構化資料

- TouristAttraction JSON-LD（名稱、`@id`、`image`、地址、座標、開放時間、`hasMap`、`sameAs`、免費屬性；評分與評價數僅於頁面展示並標註來源，不寫入 JSON-LD 以符合 Google 評價政策）
- FAQPage JSON-LD
- PWA：`public/manifest.webmanifest` 與 `public/sw.js`（僅在正式環境註冊 Service Worker）
- 即時天氣：`src/pages/api/weather.ts` 由 Cloudflare Worker 伺服器端向氣象來源取得並快取（約 30 分鐘），前端 `src/components/Weather.astro` 只向本路由 `/api/weather` 取數，頁面不暴露來源細節；含降水機率、風力（蒲福級）、紫外線與 7 日預報，並依天氣自動產出出行穿搭 / 遊玩安排 / 隨身物品 / 風險提醒。
- 內容區塊：地名由來與生態（`#heritage`）、四季遊覽策略表（`#seasons`）、推薦路線 半日/全日 與 親子/攝影/無障礙（`#routes`）、訪客服務類型總覽（`#services`）、科普與訪客責任（`#responsibility`）。
- canonical / Open Graph 由 Astro `site` 派生
- sitemap 僅在 `site` 有值時啟用 `@astrojs/sitemap`
- `robots.txt` 同樣依 `site` 決定是否輸出 sitemap URL
- GA4：`G-HXM22WWPKP`
