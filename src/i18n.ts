import {getLanguage} from 'obsidian';

/**
 * Translations used across the platform. Don't access this object directly!
 *
 * @see I18n.tr to understand how to properly access translations.
 */
const TRANSLATIONS = {
  en: {
    common: {
      edit: 'Edit',
      save: 'Save',
      create: 'Create',
      delete: 'Delete',
      execute: 'Execute',
      clear_all: 'Clear all',
      preview: 'Preview',
    },
    settings: {
      action_title: 'Actions',
      action_desc: `
        View, create, and edit actions. Once you've created/edited an action you must
        restart Obsidian for the Action to be registered, you can still test in this
        menu before restarting.
      `,
      no_actions: 'No actions created',
    },
    modal: {
      edit_title: 'Edit Action',
      edit_desc: `
        Edit an existing action. Some fields may not apply to all hooks or environments. You must restart
        Obsidian for these updated Actions to be registered.
      `,
      create_title: 'Create Action',
      create_desc: `
        Create a new action. Actions can be triggered on events, schedules, or manually. You must restart
        Obsidian for these new Actions to be registered.
      `,
      name: 'Name',
      name_desc: 'The display name for your action, this is how you\'ll recognize it in menus and ribbons.',
      name_ph: 'Open with Visual Studio Code',
      icon: 'Icon',
      icon_desc: `
        Pick an icon to represent your action. We use Lucide icons, see
        <a href="https://lucide.dev/icons" target="_blank" rel="noopener">their list</a> for options.
      `,
      type: 'Type',
      type_desc: `
        What environment will this code run in, "js" will run inside Obsidian, giving you access to
        the Obsidian developer apis, see <a href="https://docs.obsidian.md/Home" target="_blank" rel="noopener">
        their documentation</a> for more information. "shell" runs system actions in a plain shell.
      `,
      description: 'Description',
      description_desc: 'A short explanation of what your action does, this is mostly just to easily track actions in settings.',
      description_ph: 'Description Placeholder',
      hooks: 'Trigger',
      hooks_desc: 'Select when this action should run, e.g., manually, on startup, or when files change.',
      startup: 'On Startup',
      interval: 'On Schedule',
      manual: 'Manual (Command Palette)',
      createFile: 'On File Create',
      modifyFile: 'On File Modify',
      deleteFile: 'On File Delete',
      renameFile: 'On File Rename',
      schedule: 'Schedule',
      schedule_desc: 'Enter a cron-style schedule for interval actions, e.g. "* * * * *" runs every minute.',
      code: 'Code',
      code_desc: `
        The code that will be executed for this action.

        We use Mustache templates to for handling variables from the current environment,
        such as the current file path, selected text, or other editor context. See <a href="https://mustache.github.io/mustache.5.html" target="_blank" rel="noopener">Mustache Documentation</a>
        for template syntax and see our documentation for an idea of what variables are supported and where

        For "js" actions, remember you can call \`exec\` to run shell commands, and for "shell"
        actions keep in mind this is running in a plain shell, there is no aliases.
      `,
      error_name_required: 'Name is required.',
      error_icon_required: 'Icon is required.',
      error_code_required: 'Code is required.',
      error_type_required: 'Type is required.',
      error_schedule_required: 'A schedule is required when the trigger is set to "On Schedule".',
      error_duplicate_name: 'An action with this ID already exists.',
    },
  },
} as const;

type Locale = keyof typeof TRANSLATIONS;
type Namespace = keyof typeof TRANSLATIONS[Locale];
type Translations = Record<Namespace, Record<string, string>>;

/**
 * Handler for translations across the platform, create a single instance in `onload`
 * and use that throughout, this will fetch the translations associated with Obsidians set
 * locale then allow you to simply access them.
 *
 * @example
 * ```ts
 * export default class YourPlugin extends Plugin {
 *   private i18n: I18n;
 *
 *   public async onload(): Promise<void> {
 *     this.i18n = new i18n();
 *   }
 * }
 * ```
 */
export class I18n {
  private readonly translations: Translations;

  private readonly locale: Locale = 'en';

  public constructor() {
    const locale = getLanguage();

    if (TRANSLATIONS[this.locale]) {
      this.locale = locale as Locale;
    } else {
      console.warn(
        `this plugin doesn't support ${String(locale)}, feel free to leave an mr for it, defaulting back to ${String(locale)} for the now`
      );
    }

    this.translations = TRANSLATIONS[this.locale];
  }

  /**
   * Fetches a translated string using the namespace and key, this uses Obsidians
   * setup language assuming it's one of the plugins support language, if not supported
   * it'll default back to `en`.
   *
   * @param namespace The translation namespace, e.g. 'common', 'settings'
   * @param key The specific key within that namespace.
   *
   * @returns The translated string, or the key itself if missing.
   *
   * @example
   * ```ts
   * const TRANSLATIONS = {
   *   namespace_foo: {foo: 'Translated Foo'}
   * };
   *
   * const i18n = new I18n();
   *
   * i18n.tr('namespace_foo', 'foo'); // returns 'Translated Foo'
   * i18n.tr('namespace_foo', 'bar'); // returns 'bar' since the key doesn't exist in 'namespace_foo'
   * ```
   */
  public tr(namespace: Namespace, key: string): string {
    const translation = this.translations[namespace]?.[key];
    if (!translation) {
      console.warn(`couldn't find translation for ${String(key)} in ${String(namespace)}`);
      return key;
    }

    return translation;
  }
}
