import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { tooltipTransformer } from './src/lib/tooltipTransformer.ts';

export default defineConfig({
  // Per-project port — change in new projects to avoid collisions across
  // multiple learning-docs sites running in parallel (4322, 4380, …).
  server: { host: '0.0.0.0', port: 4322 },
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
