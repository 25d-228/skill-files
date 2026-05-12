import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { tooltipTransformer } from './src/lib/tooltipTransformer.ts';

export default defineConfig({
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      theme: 'solarized-light',
      transformers: [tooltipTransformer()],
    },
  },
  vite: {
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  },
});
