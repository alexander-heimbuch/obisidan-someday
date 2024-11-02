import { App, moment, PluginSettingTab, sanitizeHTMLToDom, Setting } from 'obsidian';
import SomedayPlugin from './main';
import { PluginSettings } from './types';

export const DEFAULT_SETTINGS: PluginSettings = {
  dateFormat: 'YYYY-MM-DD',
  folder: 'todos',
  dailyDefaultContent: '- [ ] '
};

export class SampleSettingTab extends PluginSettingTab {
  plugin: SomedayPlugin;

  constructor(app: App, plugin: SomedayPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
	.setName('Daily Files Location')
	.setDesc('New daily notes will be placed here')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.folder)
          .setValue(this.plugin.settings.folder)
          .onChange(async (value) => {
            this.plugin.settings.folder = value;
            await this.plugin.saveSettings();
          })
      );

	const today = moment().format(this.plugin.settings.dateFormat);

    new Setting(containerEl)
      .setName('Date format')
      .setDesc(
        sanitizeHTMLToDom(`
		For more syntax, refer to
		<a
		href="https://momentjs.com/docs/#/displaying/format/"
		target="_blank"
		rel="noopener"
		>format reference</a
		><br />Your current syntax looks like this: <b class="u-pop">${today}</b>
	`)
      )
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.dateFormat)
          .setValue(this.plugin.settings.dateFormat)
          .onChange(async (value) => {
            this.plugin.settings.dateFormat = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
