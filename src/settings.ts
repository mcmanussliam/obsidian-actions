import {PluginSettingTab, App, Setting, Modal, IconName, Notice} from 'obsidian';
import ActionsPlugin, {ActionExecution, ExecutionStatus} from './main';
import {html} from './utils/html';
import {kebabCase} from './utils/kebab-case';
import {Agenda} from './types/agenda';

export type ActionHook = 'startup' | 'interval' | 'manual' | 'createFile' | 'modifyFile' | 'deleteFile' | 'renameFile';

type ActionType = 'shell' | 'js';

export interface Action {
	/** `id` used to identify this action in the action list. */
	id: string;

	/** Name to appear in settings allowing users to identify actions. */
	name: string;

	/** Description to appear on settings page. */
	description: string;

	/**
	 * Icon to appear on settings.
	 *
	 * @see https://lucide.dev/icons for a list of possible icons.
	 */
	icon: IconName;

  /** Hook or trigger that runs this action */
  hook: ActionHook;

	/** Type for an action, this dictates what environment the action will be ran in. */
	type: ActionType;

	/**
	 * Code ran on activating it at one of the locations, this will be a string of code with
	 * the environment dictated by the `type` field.
	 *
	 * @see Environment to get an idea of the possible environment variables.
	 * @see ActionsPlugin.execute to get a better understanding of code execution and the different types.
	 */
	code: string;

  /** Optional schedule for when an action is ran on an interval. */
  schedule?: Agenda;

  /** Flag for enabling and disabling a command, while disabled a command will not run. */
  enabled: boolean;
}

export interface ActionsSettings {
	actions: Action[];
}

export const DEFAULT_SETTINGS: ActionsSettings = {actions: []};

export class SettingsTab extends PluginSettingTab {
  private readonly plugin: ActionsPlugin;

  private unsubscribeExecutionChanges?: () => void;

  public constructor(app: App, plugin: ActionsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  public display(): void {
    if (!this.unsubscribeExecutionChanges) {
      this.unsubscribeExecutionChanges = this.plugin.onExecutionChange(() => this.display());
    }

    const container = this.containerEl;
    container.empty();

    this.actions(container);
  }

  public hide(): void {
    this.unsubscribeExecutionChanges?.();
    this.unsubscribeExecutionChanges = undefined;
  }

  /**
   * Displays an extending form link input which allows you to create standalone
   * actions which you can then link to a location.
   *
   * @param host Host Element
   */
  private actions(host: HTMLElement): void {
    new Setting(host)
      .setHeading()
      .setName(this.plugin.i18n.tr('settings', 'action_title'))
      .setDesc(this.plugin.i18n.tr('settings', 'action_desc'));

    for (const [index, action] of this.plugin.settings.actions.entries()) {
      new Setting(host)
        .setName(action.name)
        .setDesc(action.description)
        .addExtraButton(btn => {
          btn
            .setIcon('play')
            .setTooltip(this.plugin.i18n.tr('common', 'execute'))
            .onClick(() => {
              this.plugin.execute(action.id, {overrides: {hello_world: 'Hello World!'}, skipChecks: true});
            });
        })
        .addExtraButton(btn => {
          btn
            .setIcon('pencil')
            .setTooltip(this.plugin.i18n.tr('common', 'edit'))
            .onClick(() => {
              const onSubmit = async(result: Action) => {
                await this.plugin.upsertAction(result, index, action.id);
                this.display();
              };

              const modal = new CreateEditActionModal(this.app, this.plugin, onSubmit, action);
              modal.open();
            });
        })
        .addExtraButton(btn => {
          btn
            .setIcon('trash')
            .setTooltip(this.plugin.i18n.tr('common', 'delete'))
            .onClick(async() => {
              await this.plugin.removeAction(action.id);
              this.display();
            });
        })
        .addToggle(tgl => {
          tgl
            .setValue(action.enabled)
            .onChange(async flag => {
              await this.plugin.setActionEnabled(action.id, flag);
              this.display();
            });
        });

      this.executionLog(host, action);
    }

    const controls = new Setting(host);

    if (this.plugin.settings.actions.length) {
      controls.addButton(btn => {
        btn
          .setButtonText(this.plugin.i18n.tr('common', 'clear_all'))
          .onClick(async() => {
            await this.plugin.clearActions();
            this.display();
          });
      });
    } else {
      controls.setDesc(this.plugin.i18n.tr('settings', 'no_actions'));
    }

    controls.addButton(btn => {
      btn
        .setCta()
        .setButtonText(this.plugin.i18n.tr('common', 'create'))
        .onClick(() => {
          const onSubmit = async(action: Action) => {
            await this.plugin.upsertAction(action);
            this.display();
          };

          const modal = new CreateEditActionModal(this.app, this.plugin, onSubmit);
          modal.open();
        });
    });
  }

  private executionLog(host: HTMLElement, action: Action): void {
    const executions = this.plugin.getExecutions(action.id);
    const wrapper = host.createDiv({cls: 'action-run-log'});
    const header = wrapper.createDiv({cls: 'action-run-log__header'});
    const title = header.createDiv({cls: 'action-run-log__title'});
    title.setText(this.plugin.i18n.tr('settings', 'run_log_title'));

    if (executions.length) {
      const clearButton = header.createEl('button', {
        cls: 'mod-muted action-run-log__clear',
        text: this.plugin.i18n.tr('common', 'clear'),
      });

      clearButton.addEventListener('click', () => {
        this.plugin.clearExecutions(action.id);
      });
    }

    if (!executions.length) {
      wrapper.createDiv({
        cls: 'action-run-log__empty',
        text: this.plugin.i18n.tr('settings', 'run_log_empty'),
      });
      return;
    }

    for (const execution of executions) {
      const item = wrapper.createDiv({cls: 'action-run-log__item'});
      const meta = item.createDiv({cls: 'action-run-log__meta'});
      meta.createSpan({
        cls: `action-run-log__status action-run-log__status--${execution.status}`,
        text: this.statusLabel(execution.status),
      });

      const summary = this.formatExecutionSummary(execution);
      if (summary) {
        meta.createSpan({cls: 'action-run-log__summary', text: summary});
      }

      if (execution.error) {
        item.createEl('pre', {cls: 'action-run-log__output action-run-log__output--error', text: execution.error});
      }

      if (execution.stdout) {
        item.createEl('pre', {cls: 'action-run-log__output', text: execution.stdout});
      }

      if (execution.stderr) {
        item.createEl('pre', {cls: 'action-run-log__output action-run-log__output--error', text: execution.stderr});
      }
    }
  }

  private statusLabel(status: ExecutionStatus): string {
    switch (status) {
      case 'running':
        return this.plugin.i18n.tr('settings', 'run_status_running');
      case 'success':
        return this.plugin.i18n.tr('settings', 'run_status_success');
      case 'failed':
        return this.plugin.i18n.tr('settings', 'run_status_failed');
    }
  }

  private formatExecutionSummary(execution: ActionExecution): string {
    const parts = [new Date(execution.startedAt).toLocaleString()];

    if (typeof execution.durationMs === 'number') {
      parts.push(`${execution.durationMs}ms`);
    }

    return parts.join(' - ');
  }
}

export class CreateEditActionModal extends Modal {
  private readonly plugin: ActionsPlugin;

  private readonly payload: Action;

  private readonly editing: boolean;

  private readonly original?: string;

  private readonly onSubmit: (_: Action) => Promise<void>;

  public constructor(app: App, plugin: ActionsPlugin, onSubmit: (_: Action) => Promise<void>, payload?: Action) {
    super(app);

    this.plugin = plugin;
    this.onSubmit = onSubmit;

    if (payload) {
      this.editing = true;
      this.original = payload.id;
      this.payload = {...payload};
    } else {
      this.editing = false;
      this.payload = {
        id: '',
        type: 'shell',
        name: '',
        description: '',
        icon: '',
        code: '',
        hook: 'manual',
        enabled: false,
      };
    }

    this.display();
  }

  private display(): void {
    this.setTitle(this.plugin.i18n.tr('modal', this.editing ? 'edit_title' : 'create_title'));
    const container = this.contentEl;

    new Setting(container).setDesc(this.plugin.i18n.tr('modal', this.editing ? 'edit_desc' : 'create_desc'));

    // Name
    new Setting(container)
      .setName(this.plugin.i18n.tr('modal', 'name'))
      .setDesc(this.plugin.i18n.tr('modal', 'name_desc'))
      .addText(text => {
        text
          .setValue(this.payload.name)
          .setPlaceholder(this.plugin.i18n.tr('modal', 'name_ph'))
          .onChange(value => {
            this.payload.name = value;
            this.payload.id = kebabCase(this.payload.name);
          });
      });

    // Icon
    new Setting(container)
      .setName(this.plugin.i18n.tr('modal', 'icon'))
      .setDesc(html(this.plugin.i18n.tr('modal', 'icon_desc')))
      .addText(text => {
        text
          .setValue(this.payload.icon)
          .onChange(value => {
            this.payload.icon = value;
          });
      });

    // Description
    new Setting(container)
      .setName(this.plugin.i18n.tr('modal', 'description'))
      .setDesc(this.plugin.i18n.tr('modal', 'description_desc'))
      .addTextArea(text => {
        text
          .setValue(this.payload.description)
          .setPlaceholder(this.plugin.i18n.tr('modal', 'description_ph'))
          .onChange(value => (this.payload.description = value));
      });

    // Hooks
    new Setting(container)
      .setName(this.plugin.i18n.tr('modal', 'hooks'))
      .setDesc(this.plugin.i18n.tr('modal', 'hooks_desc'))
      .addDropdown(dropdown => {
        const availableHooks: Record<ActionHook, string> = {
          startup: this.plugin.i18n.tr('modal', 'startup'),
          interval: this.plugin.i18n.tr('modal', 'interval'),
          manual: this.plugin.i18n.tr('modal', 'manual'),
          createFile: this.plugin.i18n.tr('modal', 'createFile'),
          modifyFile: this.plugin.i18n.tr('modal', 'modifyFile'),
          deleteFile: this.plugin.i18n.tr('modal', 'deleteFile'),
          renameFile: this.plugin.i18n.tr('modal', 'renameFile'),
        };

        for (const [value, label] of Object.entries(availableHooks)) {
          dropdown.addOption(value, label);
        }

        dropdown.setValue(this.payload.hook);
        dropdown.onChange(value => {
          this.payload.hook = value as ActionHook;
          isInterval();
        });
      });

    // Schedule
    const scheduleSetting = new Setting(container)
      .setName(this.plugin.i18n.tr('modal', 'schedule'))
      .setDesc(this.plugin.i18n.tr('modal', 'schedule_desc'))
      .addText(text => {
        text
          .setPlaceholder('* * * * *')
          .setValue(this.payload.schedule || '')
          .onChange(value => (this.payload.schedule = value));
      });

    const isInterval = () => {
      const selectedHook = this.payload.hook;
      const el = scheduleSetting.settingEl;

      if (selectedHook === 'interval') {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    };

    isInterval();

    // Type
    new Setting(container)
      .setName(this.plugin.i18n.tr('modal', 'type'))
      .setDesc(html(this.plugin.i18n.tr('modal', 'type_desc')))
      .addDropdown(dropdown => {
        const options: Record<string, ActionType> = {
          shell: 'shell',
          js: 'js',
        };

        dropdown
          .addOptions(options)
          .setValue(this.payload.type)
          .onChange(type => (this.payload.type = type as ActionType));
      })
      .setClass('code');

    // Code
    new Setting(container)
      .setName(this.plugin.i18n.tr('modal', 'code'))
      .setDesc(html(this.plugin.i18n.tr('modal', 'code_desc')))
      .addTextArea(text => {
        text
          .setValue(this.payload.code)
          .setPlaceholder('Hello world!')
          .onChange(value => (this.payload.code = value));
      })
      .setClass('code-box');

    // Submit
    new Setting(this.contentEl)
      .addButton(btn => {
        btn
          .setButtonText(this.plugin.i18n.tr('common', this.editing ? 'save' : 'create'))
          .setCta()
          .onClick(async() => {
            const valid = this.validate();
            if (!valid) {
              return;
            }

            await this.onSubmit(this.payload);
            this.close();
          });
        });
  }

  private validate(): boolean {
    const {name, code, type, hook, schedule} = this.payload;

    if (!name.trim()) {
      new Notice(this.plugin.i18n.tr('modal', 'error_name_required'));
      return false;
    }

    if (!code.trim()) {
      new Notice(this.plugin.i18n.tr('modal', 'error_code_required'));
      return false;
    }

    if (!type) {
      new Notice(this.plugin.i18n.tr('modal', 'error_type_required'));
      return false;
    }

    if (hook === 'interval' && !schedule) {
      new Notice(this.plugin.i18n.tr('modal', 'error_schedule_required'));
      return false;
    }

    if (hook !== 'interval') {
      delete this.payload.schedule;
    }

    if (this.original && this.original !== this.payload.id && this.plugin.actions.has(this.payload.id)) {
      new Notice(this.plugin.i18n.tr('modal', 'error_duplicate_name'));
      return false;
    }

    return true;
  }
}
