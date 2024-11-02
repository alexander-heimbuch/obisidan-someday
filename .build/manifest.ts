import { resolve } from 'node:path';
import { readJSONSync, writeJSONSync } from 'fs-extra';
import { Plugin, ResolvedConfig } from 'vite';

export default function obsidianPlugin(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'obsidian-manifest',

    configResolved(conf) {
      config = conf;
    },

    buildEnd() {
      const pkg = readJSONSync(resolve(__dirname, '..', 'package.json'));
      const manifest = {
        id: pkg.name,
        version: pkg.version,
        author: pkg.author,
        ...pkg.obsidian
      };

	  writeJSONSync(resolve(config.build.outDir, "manifest.json"), manifest);
    }
  };
}
