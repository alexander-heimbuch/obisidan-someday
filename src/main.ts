import { App, moment, normalizePath, Notice, Plugin, TFile } from 'obsidian';
import { PluginSettings } from './types';
import { DEFAULT_SETTINGS, SampleSettingTab } from './settings';
import { filterFinishedItems, transform, updateMovedItems } from './lib/markdown';
import { getFileContent, openFile } from './lib/obsidian';

export default class SomedayPlugin extends Plugin {
  settings: PluginSettings;

  async onload() {
    this.settings = await this.loadSettings();

    this.app.workspace.onLayoutReady(() => {
      this.prepareEnvironment(this.app, this.settings);
    });

    // This creates an icon in the left ribbon.
    this.addRibbonIcon('clipboard-check', 'Create someday note', (evt: MouseEvent) => {
      // Called when the user clicks the icon.
      this.createDailyNote(this.app, this.settings);
    });

    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: 'someday-new-daily-note',
      name: 'Create daily note',
      callback: () => {
        this.createDailyNote(this.app, this.settings);
      }
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new SampleSettingTab(this.app, this));
  }

  onunload() {}

  async loadSettings(): Promise<PluginSettings> {
    const settings = (await this.loadData()) || {};

    return Object.entries(DEFAULT_SETTINGS).reduce(
      (result: PluginSettings, [key, defaultValue]: [keyof PluginSettings, string]) => {
        const value = settings[key] || defaultValue;

        switch (key) {
          case 'folder':
            result[key] = normalizePath(value);
            break;
          default:
            result[key] = value;
        }

        return result;
      },
      DEFAULT_SETTINGS
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // TODO: call this on settings change
  async prepareEnvironment(app: App, settings: PluginSettings) {
    const folder = app.vault.getFolderByPath(settings.folder);

    if (folder === null) {
      app.vault.createFolder(settings.folder);
    }
  }

  async createDailyNote(app: App, settings: PluginSettings) {
    const today = moment().format(settings.dateFormat);

    const dailyTodos =
      app.vault
        .getFolderByPath(settings.folder)
        ?.children.map((file: TFile & { basename: string }) => ({
          ...file,
          date: moment(file?.basename, settings.dateFormat)
        }))
        .filter((file) => file.basename !== today)
        .filter(({ date }) => date.isValid())
        .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime()) || [];

    const previousDayFileIndex: number = dailyTodos.reduce(
      (prevIndex, curr: TFile & { date: moment.Moment }, index) => {

        console.log(curr, curr.date.toDate().getTime() > Date.now());
        if (curr.date.toDate().getTime() > Date.now()) {
          return prevIndex;
        }

        return index;
      },
      -1
    );

    let unfinishedItems = '';

    if (previousDayFileIndex > -1) {
      const previousFiles = dailyTodos.slice(previousDayFileIndex - 6, previousDayFileIndex + 1);
      for (const previousFile of previousFiles) {
        const file = app.vault.getFileByPath(previousFile.path);

        if (!file) {
          return;
        }

        const fileContent = await getFileContent(app, file.path);
        app.vault.modify(file, updateMovedItems(fileContent));

        unfinishedItems =
          unfinishedItems + (await transform(fileContent, filterFinishedItems).then((res) => res.trim() + '\n' ));
      }
    }

    const filePath = normalizePath(`${settings.folder}/${today}.md`);
    const currentDailyfile = app.vault.getFileByPath(filePath);

    if (currentDailyfile) {
      const currentDayContent = await getFileContent(app, currentDailyfile.path);

      if (!currentDayContent.trim().includes((unfinishedItems || '').trim())) {
        await app.vault.append(currentDailyfile, unfinishedItems || '');
      }
    } else {
      await app.vault.create(filePath, unfinishedItems || settings.dailyDefaultContent);
      new Notice(`Daily note created`);
    }

    openFile(app, filePath);
  }
}
