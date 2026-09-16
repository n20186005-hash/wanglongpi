import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// 唯一站點域名設定點。確定域名後只需填寫這裡。
// 留空時仍可正常建置；canonical / OG URL / JSON-LD URL / sitemap 會自動降級或停用。
const SITE_URL = '';

export default defineConfig({
  site: SITE_URL || undefined,
  output: 'server',
  adapter: cloudflare(),
  integrations: [SITE_URL ? sitemap({ namespaces: { news: false, video: false } }) : false],
  vite: {
    plugins: [tailwindcss()]
  }
});
