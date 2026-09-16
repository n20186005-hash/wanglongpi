import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
if (!existsSync(dist)) throw new Error('dist/ 不存在，請先執行 pnpm build');

const forbidden = ['example' + '.com', 'local' + 'host', 'chrome-extension' + '://'];
const textExts = new Set(['.html', '.xml', '.txt', '.js', '.css', '.json', '.map']);
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) walk(path);
    else files.push(path);
  }
};
walk(dist);

const hits = [];
for (const file of files) {
  const ext = file.slice(file.lastIndexOf('.'));
  if (!textExts.has(ext)) continue;
  const body = readFileSync(file, 'utf8');
  for (const needle of forbidden) if (body.includes(needle)) hits.push(`${needle}: ${file}`);
}
if (hits.length) throw new Error(`發現禁止內容：\n${hits.join('\n')}`);

const sitemapFiles = files.filter((f) => /sitemap.*\.xml$/.test(f));
for (const file of sitemapFiles) {
  const body = readFileSync(file, 'utf8');
  if (forbidden.slice(0, 2).some((needle) => body.includes(needle))) throw new Error(`sitemap 含占位網域：${file}`);
  if (/<lastmod>/i.test(body)) throw new Error(`sitemap 含 lastmod，請確認不是人工編造：${file}`);
}

console.log(`OK：已掃描 ${files.length} 個 dist 檔案；未發現禁止占位內容。`);
console.log(sitemapFiles.length ? `OK：已檢查 ${sitemapFiles.length} 個 sitemap 檔案。` : 'INFO：未產生 sitemap（SITE_URL 留空時屬預期行為）。');
