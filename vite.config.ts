import { defineConfig } from 'vitest/config';
import fr from './src/data/fr.json' with { type: 'json' };
import en from './src/data/en.json' with { type: 'json' };

const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export default defineConfig({
  base: './',
  plugins: [{ name: 'loading-copy', transformIndexHtml: html => {
    for (const [language, texts] of [['FR', fr.loading], ['EN', en.loading]] as const)
      for (const [key, value] of Object.entries(texts))
        html = html.replaceAll(`%LOADING_${key.toUpperCase()}_${language}%`, escapeHtml(value));
    return html;
  } }],
  server: { watch: { ignored: ['**/.tmp/**'] } },
  test: {
    environment: 'node',
    include: ['src/tests/**/*.test.ts'],
  },
});
