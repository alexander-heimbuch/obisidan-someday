import { App, normalizePath, TFile } from "obsidian";

export const openFile = (app: App, file: string) => {
  const leaf = app.workspace.getLeaf(false);
  const filePath = app.vault.getFileByPath(normalizePath(file));

  if (filePath) {
    leaf.openFile(filePath);
  }
}

export const getFileContent = (app: App, filePath: string): Promise<string> => {
  const file = app.vault.getFileByPath(normalizePath(filePath));
  return app.vault.cachedRead(file as TFile);
}
