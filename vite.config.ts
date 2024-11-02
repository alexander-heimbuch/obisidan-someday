import { defineConfig } from 'vite';
import * as builtins from 'builtin-modules';
import obsidianPlugin from '.build/manifest';

export default defineConfig({
  build: {
    // Let the library user control minification in their own bundler
    minify: true,
    emptyOutDir: false,
    lib: {
      name: 'someday',
      entry: {
        main: './src/main.ts'
      },
      formats: ['cjs']
    },
    rollupOptions: {
      // Add _all_ external dependencies here
      external: [
        'obsidian',
        'electron',
        '@codemirror/autocomplete',
        '@codemirror/collab',
        '@codemirror/commands',
        '@codemirror/language',
        '@codemirror/lint',
        '@codemirror/search',
        '@codemirror/state',
        '@codemirror/view',
        '@lezer/common',
        '@lezer/highlight',
        '@lezer/lr',
        ...builtins
      ]
    }
  },
  plugins: [obsidianPlugin()]
});
