# 驗收狀態

## 已完成的本地靜態檢查

- `astro.config.ts`、`robots.txt.ts` 與 Astro frontmatter 已用 TypeScript parser 做語法檢查，未發現語法錯誤。
- 專案原始碼已掃描常見占位網域與瀏覽器擴充功能注入協定，未發現命中。
- 未建立 `pnpm-workspace.yaml`，符合單包專案要求。
- `site` 僅在 `astro.config.ts` 的 `SITE_URL` 設定；留空時 sitemap integration 停用，canonical / OG / JSON-LD 絕對 URL 省略。
- 另附 `pnpm verify`，可在 build 後掃描 `dist/` 的占位網域與 sitemap `lastmod`。

## 執行環境限制

本次產檔環境無法連線 npm registry，且本機沒有 pnpm / Astro 相依套件快取。因此無法在此環境可靠產生與 `package.json` 同步的 `pnpm-lock.yaml`，也無法誠實宣稱已完成以下要求的乾淨環境驗收：

```bash
rm -rf node_modules
CI=1 corepack pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm verify
```

為避免交付一個偽造或不完整、會讓 `--frozen-lockfile` 失敗的 lockfile，本包沒有放入冒充同步完成的 `pnpm-lock.yaml`。這是目前唯一未達成的工程交付項目。
