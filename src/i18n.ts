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
      clear_all: 'Clear All',
      preview: 'Preview',
    },
    settings: {
      action_title: 'Actions',
      action_desc: `
        View, create, and edit actions. Once you've created/edited an action you must
        restart Obsidian for the Action to be registered, you can still test in this
        menu before restarting.
      `,
      no_actions: 'No Actions Created',
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
  de: {
    common: {
      edit: 'Bearbeiten',
      save: 'Speichern',
      create: 'Erstellen',
      delete: 'Löschen',
      execute: 'Ausführen',
      clear_all: 'Alles löschen',
      preview: 'Vorschau',
    },
    settings: {
      action_title: 'Aktionen',
      action_desc: `
      Aktionen anzeigen, erstellen und bearbeiten. Nach dem Erstellen/Bearbeiten einer Aktion muss Obsidian neu gestartet werden, um
      die Aktion zu registrieren.
      `,
      no_actions: 'Keine Aktionen erstellt',
    },
    modal: {
      edit_title: 'Aktion bearbeiten',
      edit_desc: `
      Bearbeiten Sie eine bestehende Aktion. Einige Felder gelten möglicherweise nicht für alle Hooks oder Umgebungen. Obsidian muss neu
      gestartet werden.
      `,
      create_title: 'Aktion erstellen',
      create_desc: `
      Erstellen Sie eine neue Aktion. Aktionen können durch Ereignisse, Zeitpläne oder manuell ausgelöst werden. Obsidian muss
      neu gestartet werden.
      `,
      name: 'Name',
      name_desc: 'Der Anzeigename Ihrer Aktion, so erkennen Sie sie in Menüs und Ribbons.',
      name_ph: 'Mit Visual Studio Code öffnen',
      icon: 'Symbol',
      icon_desc: 'Wählen Sie ein Symbol für Ihre Aktion. Wir verwenden Lucide-Symbole.',
      type: 'Typ',
      type_desc: '"js" läuft in Obsidian mit Zugriff auf Entwickler-APIs, "shell" führt Systemaktionen aus.',
      description: 'Beschreibung',
      description_desc: 'Kurze Erklärung, was Ihre Aktion tut.',
      description_ph: 'Beschreibung Platzhalter',
      hooks: 'Auslöser',
      hooks_desc: 'Wählen Sie, wann die Aktion ausgeführt werden soll.',
      startup: 'Beim Start',
      interval: 'Nach Zeitplan',
      manual: 'Manuell (Befehls-Palette)',
      createFile: 'Bei Dateierstellung',
      modifyFile: 'Bei Dateiveränderung',
      deleteFile: 'Bei Dateilöschung',
      renameFile: 'Bei Umbenennung',
      schedule: 'Zeitplan',
      schedule_desc: 'Cron-artiger Zeitplan für wiederkehrende Aktionen.',
      code: 'Code',
      code_desc: 'Der auszuführende Code für diese Aktion.',
      error_name_required: 'Name ist erforderlich.',
      error_icon_required: 'Symbol ist erforderlich.',
      error_code_required: 'Code ist erforderlich.',
      error_type_required: 'Typ ist erforderlich.',
      error_schedule_required: 'Ein Zeitplan ist erforderlich, wenn der Auslöser "Nach Zeitplan" ist.',
      error_duplicate_name: 'Eine Aktion mit dieser ID existiert bereits.',
    },
  },
  es: {
    common: {
      edit: 'Editar',
      save: 'Guardar',
      create: 'Crear',
      delete: 'Eliminar',
      execute: 'Ejecutar',
      clear_all: 'Borrar todo',
      preview: 'Previsualizar',
    },
    settings: {
      action_title: 'Acciones',
      action_desc: 'Ver, crear y editar acciones. Tras crear/editar una acción, se debe reiniciar Obsidian para registrarla.',
      no_actions: 'No se han creado acciones',
    },
    modal: {
      edit_title: 'Editar Acción',
      edit_desc: 'Editar una acción existente. Algunos campos pueden no aplicarse a todos los hooks o entornos. Reinicie Obsidian.',
      create_title: 'Crear Acción',
      create_desc: 'Crear una nueva acción. Las acciones se pueden activar por eventos, horarios o manualmente. Reinicie Obsidian.',
      name: 'Nombre',
      name_desc: 'El nombre visible de la acción, para reconocerla en menús y ribbons.',
      name_ph: 'Abrir con Visual Studio Code',
      icon: 'Icono',
      icon_desc: 'Seleccione un icono para representar su acción.',
      type: 'Tipo',
      type_desc: '"js" se ejecuta dentro de Obsidian, "shell" ejecuta acciones del sistema.',
      description: 'Descripción',
      description_desc: 'Breve explicación de lo que hace la acción.',
      description_ph: 'Marcador de descripción',
      hooks: 'Disparador',
      hooks_desc: 'Seleccione cuándo debe ejecutarse la acción.',
      startup: 'Al iniciar',
      interval: 'Programado',
      manual: 'Manual (Paleta de Comandos)',
      createFile: 'Al crear archivo',
      modifyFile: 'Al modificar archivo',
      deleteFile: 'Al eliminar archivo',
      renameFile: 'Al renombrar archivo',
      schedule: 'Horario',
      schedule_desc: 'Horario estilo cron para acciones periódicas.',
      code: 'Código',
      code_desc: 'El código que se ejecutará para esta acción.',
      error_name_required: 'Se requiere un nombre.',
      error_icon_required: 'Se requiere un icono.',
      error_code_required: 'Se requiere código.',
      error_type_required: 'Se requiere tipo.',
      error_schedule_required: 'Se requiere un horario si el disparador es "Programado".',
      error_duplicate_name: 'Ya existe una acción con este ID.',
    },
  },
  fr: {
    common: {
      edit: 'Modifier',
      save: 'Enregistrer',
      create: 'Créer',
      delete: 'Supprimer',
      execute: 'Exécuter',
      clear_all: 'Tout effacer',
      preview: 'Aperçu',
    },
    settings: {
      action_title: 'Actions',
      action_desc: 'Voir, créer et modifier des actions. Après création/modification, redémarrez Obsidian pour enregistrer.',
      no_actions: 'Aucune action créée',
    },
    modal: {
      edit_title: 'Modifier l’action',
      edit_desc: 'Modifier une action existante. Certains champs peuvent ne pas s’appliquer à tous les hooks ou environnements. Redémarrez Obsidian.',
      create_title: 'Créer une action',
      create_desc: 'Créer une nouvelle action. Les actions peuvent être déclenchées par événements, horaires ou manuellement. Redémarrez Obsidian.',
      name: 'Nom',
      name_desc: 'Nom affiché de l’action, pour la reconnaître dans les menus et ribbons.',
      name_ph: 'Ouvrir avec Visual Studio Code',
      icon: 'Icône',
      icon_desc: 'Choisissez une icône pour représenter votre action.',
      type: 'Type',
      type_desc: '"js" s’exécute dans Obsidian, "shell" exécute des actions système.',
      description: 'Description',
      description_desc: 'Brève explication de ce que fait l’action.',
      description_ph: 'Description',
      hooks: 'Déclencheur',
      hooks_desc: 'Sélectionnez quand cette action doit s’exécuter.',
      startup: 'Au démarrage',
      interval: 'Programmée',
      manual: 'Manuelle (Palette de commandes)',
      createFile: 'À la création du fichier',
      modifyFile: 'À la modification du fichier',
      deleteFile: 'À la suppression du fichier',
      renameFile: 'Au renommage du fichier',
      schedule: 'Planification',
      schedule_desc: 'Planification de style cron pour actions périodiques.',
      code: 'Code',
      code_desc: 'Code exécuté pour cette action.',
      error_name_required: 'Le nom est requis.',
      error_icon_required: 'L’icône est requise.',
      error_code_required: 'Le code est requis.',
      error_type_required: 'Le type est requis.',
      error_schedule_required: 'Une planification est requise si le déclencheur est "Programmée".',
      error_duplicate_name: 'Une action avec cet ID existe déjà.',
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

  constructor() {
    const locale = getLanguage() as Locale;
    if (locale) {
      this.locale = locale;
    } else {
      console.warn(`this plugin doesn't support ${locale}, feel free to leave an mr for it, defaulting back to ${locale} for the npw`);
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
      console.warn(`couldn't find translation for ${key} in ${namespace}`);
      return key;
    }

    return translation;
  }
}
