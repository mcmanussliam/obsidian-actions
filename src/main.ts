import {FileSystemAdapter, FuzzySuggestModal, Modal, normalizePath, Notice, Plugin, Setting, TAbstractFile} from 'obsidian';
import {DEFAULT_SETTINGS, SettingsTab, ActionsSettings, Action} from './settings';
import {keyByMap} from './utils/key-by-map';
import {ChildProcess, exec, ExecException, ExecOptions} from 'child_process';
import Mustache from 'mustache';
import {CronJob} from 'cron';
import {I18n} from './i18n';
import path from 'path';
import './styles.css';
/**
 * Environment variables to use in the actions controlled environments,
 * not every value here will be accessible in all contexts.
 *
 * @see ActionsPlugin.execute to understand how these are used.
 */
interface Environment {
	/** Returns the absolute path to the file */
	path: string;

	/** Returns the relative path to the file from the root of the obsidian vault */
	relative_path: string;

	/** Returns the file extension */
	extension: string;

	/** Returns true if editor is in read-only mode */
	readonly: boolean;

	/** Returns the selected text in the editor */
	selected: string;

	/** Returns the selected text in the editor but in lower case */
	selected_lower: string;

	/** Returns the selected text in the editor but in upper case */
	selected_upper: string;

	/** Returns the length of selected text in the editor */
	length_selected: number;

	/** Returns the word count of entire file or selection */
	word_count: number;

	/** Returns the zero based index of the current line */
	line_index: number;

	/** Vault name */
	vault_name: string;

	/** File name without extension */
	file_name: string;

	/** File name with extension */
	file_name_with_ext: string;

	/** Full file content */
	content: string;

	/** Total character count in file */
	content_length: number;

	/** Current column position of the cursor */
	column_index: number;

	/** ISO timestamp of when the command is executed */
	timestamp: string;

	/** Human-readable date */
	date: string;

	/** Current time */
	time: string;

	/** Purely for testing purposes */
	hello_world: string;
}

interface ExecutionOptions {
	/** Template variables to override the default environment variables with. */
	overrides: Partial<Environment>;

	/** Skip checking whether an action is enabled. */
	skipChecks: boolean;
}

type ExecCallback = (_error: ExecException | null, _stdout: string, _stderr: string) => void;

export default class ActionsPlugin extends Plugin {
	public i18n: I18n;

	public settings: ActionsSettings;

	public actions: Map<string, Action>;

	public readonly jobs: Map<string, CronJob> = new Map();

	private readonly activeChildren: Set<ChildProcess> = new Set();

	public async onload(): Promise<void> {
		this.i18n = new I18n();

		this.settings = await this.loadSettings();
		this.actions = keyByMap(this.settings.actions, a => a.id, a => a);

		await this.registerActions();
		this.addSettingTab(new SettingsTab(this.app, this));
	}

	public onunload(): void {
		for (const job of this.jobs.values()) {
			void job.stop();
		}

		this.jobs.clear();

		for (const child of this.activeChildren) {
			if (!child.killed) {
				child.kill();
			}
		}

		this.activeChildren.clear();
	}

	public async upsertAction(action: Action, index?: number, previousId?: string): Promise<void> {
		if (typeof index === 'number') {
			this.settings.actions[index] = action;
		} else {
			this.settings.actions.push(action);
		}

		if (previousId && previousId !== action.id) {
			this.actions.delete(previousId);
			await this.stopJob(previousId);
		}

		this.actions.set(action.id, action);

		if (action.enabled && action.hook === 'interval') {
			await this.registerIntervalAction(action);
		} else {
			await this.stopJob(action.id);
		}

		await this.saveSettings();
	}

	public async removeAction(id: string): Promise<void> {
		this.settings.actions = this.settings.actions.filter(action => action.id !== id);
		this.actions.delete(id);
		await this.stopJob(id);
		await this.saveSettings();
	}

	public async clearActions(): Promise<void> {
		for (const id of this.actions.keys()) {
			await this.stopJob(id);
		}

		this.settings.actions = [];
		this.actions.clear();
		await this.saveSettings();
	}

	public async setActionEnabled(id: string, enabled: boolean): Promise<void> {
		const action = this.actions.get(id);
		if (!action) {
			return;
		}

		action.enabled = enabled;

		if (action.enabled && action.hook === 'interval') {
			await this.registerIntervalAction(action);
		} else {
			await this.stopJob(id);
		}

		await this.saveSettings();
	}

	private async registerActions(): Promise<void> {
		for (const action of this.settings.actions) {
			if (!action.enabled) {
				await this.stopJob(action.id);
				continue;
			}

			switch (action.hook) {
				case 'startup': {
					void this.execute(action.id);
					console.debug(`registered startup action ${action.id}`);
					break;
				}

				case 'manual': {
					this.addCommand({
						id: `actions-plugin:${action.id}`,
						name: action.name,
						callback: () => void this.execute(action.id),
					});

					console.debug(`registered manual action ${action.id}`);
					break;
				}

				case 'createFile': {
					this.registerEvent(this.app.vault.on('create', file => {
						void this.execute(action.id, {overrides: this.fileEnvironment(file)});
					}));

					console.debug(`registered create file action ${action.id}`);
					break;
				}

				case 'modifyFile': {
					this.registerEvent(this.app.vault.on('modify', file => {
						void this.execute(action.id, {overrides: this.fileEnvironment(file)});
					}));

					console.debug(`registered modify file action ${action.id}`);
					break;
				}

				case 'deleteFile': {
					this.registerEvent(this.app.vault.on('delete', file => {
						void this.execute(action.id, {overrides: this.fileEnvironment(file)});
					}));

					console.debug(`registered delete file action ${action.id}`);
					break;
				}

				case 'renameFile': {
					this.registerEvent(this.app.vault.on('rename', file => {
						void this.execute(action.id, {overrides: this.fileEnvironment(file)});
					}));

					console.debug(`registered rename file action ${action.id}`);
					break;
				}

				case 'interval': {
					await this.registerIntervalAction(action);
					console.debug(`registered interval action ${action.id} with schedule ${action.schedule}`);
					break;
				}
			}
		}
	}

	private async registerIntervalAction(action: Action): Promise<void> {
		const cronTime = action.schedule;
		if (!cronTime) {
			console.error(`invalid setup for interval action ${action.id}, missing schedule`);
			return;
		}

		await this.stopJob(action.id);

		try {
			const job = CronJob.from({
				onTick: () => void this.execute(action.id),
				start: true,
				cronTime,
			});

			this.jobs.set(action.id, job);
		} catch (err) {
			console.error(`failed to register interval action ${action.id}`, err);
		}
	}

	private async stopJob(id: string): Promise<void> {
		const existingJob = this.jobs.get(id);
		if (!existingJob) {
			return;
		}

		await existingJob.stop();
		this.jobs.delete(id);
	}

	/**
	 * Generate an environment used to populate the template variables, this
	 * is generated based on the current state of the obsidian app.
	 *
	 * See the handlers below to understand how this is used.
	 *
	 * @see handleJS Executes in a controlled JavaScript environment.
	 * @see handleShell Executes in a plain shell environment.
	 */
	private environment(fileOverride?: TAbstractFile): Partial<Environment> {
		const env: Partial<Environment> = {};

		const file = fileOverride ?? this.app.workspace.getActiveFile();
		if (file) {
			const {adapter} = this.app.vault;
			const extension = path.extname(file.path).replace(/^\./, '');

			if (adapter instanceof FileSystemAdapter) {
				const vault = adapter.getBasePath();
				env.path = normalizePath(path.join(vault, file.path));
			} else {
				env.path = file.path;
			}

			env.relative_path = file.path;
			env.extension = extension;

			env.file_name_with_ext = path.basename(file.path);
			env.file_name = extension ? path.basename(file.path, `.${extension}`) : path.basename(file.path);
		}

		const editor = this.app.workspace.activeEditor?.editor;

		const cursor = editor?.getCursor?.();
		env.line_index = cursor?.line;

		env.selected = editor?.getSelection?.();
		env.selected_lower = env.selected?.toLowerCase();
		env.selected_upper = env.selected?.toUpperCase();
		env.length_selected = env.selected?.length;

		const content = editor?.getValue?.();
		const text = env.selected || content;
		env.word_count = text?.trim() ? text.trim().split(/\s+/).length : 0;

		env.content = content;
		env.content_length = content?.length;

		const now = new Date();
		env.timestamp = now.toISOString();
		env.date = now.toLocaleDateString();
		env.time = now.toLocaleTimeString();

		return env;
	}

	private fileEnvironment(file: TAbstractFile): Partial<Environment> {
		return this.environment(file);
	}

	/**
	 * Execute a given action, this will populate the template using the provided environment variables,
	 * and `action.code`s template, it'll then executes the action in a controller environment depending
	 * on the type.
	 *
	 * @param {string} id id for the given command to execute.
	 * @param {Partial<Environment>} overrides template variables to override the default environment variables with.
	 * @param {true} skipCheck skip checking whether the action is enabled.
	 *
	 * See the handlers below
	 *
	 * @see https://mustache.github.io/mustache.5.html For a better understanding on Mustache templates
	 *
	 * @see handleJS Executes in a controlled JavaScript environment.
	 * @see handleShell Executes in a plain shell environment.
	 */
	public execute(id: string, options?: Partial<ExecutionOptions>): void {
		const env = options?.overrides ? {...this.environment(), ...options?.overrides} : this.environment();

		const action = this.actions.get(id);
		if (!action) {
			console.warn(`attempted to execute action '${id}', which isn't registered.`);
			return;
		}

		if (!action.enabled && !options?.skipChecks) {
			console.debug(`attempted to execute action '${id}', which isn't enabled.`);
			return;
		}

		const code = Mustache.render(action.code, env);

		switch (action.type) {
			case 'js': {
				this.handleJS(id, code);
				break;
			}

			case 'shell': {
				this.handleShell(id, code);
				break;
			}
		}
	}

	/**
	 * Executes a given JavaScript action.
	 *
	 * This runs in a controlled environment that exposes a limited set of helper
	 * objects and functions, these include `exec` and most of the Obsidian developer
	 * `api`.
	 *
	 * @param {string} id id for the given command to execute, used for logging.
	 * @param {string} code actual code for the method to execute.
	 *
	 * @see methods For a better idea on what is supported
	 * @see https://docs.obsidian.md To understand how to use specific parts of the `api`
	 *
	 * @example
	 * ```ts
	 * this.handleJS('hello-world', `
	 *   new Notice('Hello World!');
	 *   console.log(app.vault.getFiles());
	 * `);
	 * ```
	 *
	 * You can also call `exec` in a `js` action to execute a `shell` action, which leads to some
	 * really nice interaction, see:
	 *
	 * ```ts
	 * this.handleJS('open-with-vs-code', `
	 *   new Notice('Opening in VS Code!');
	 *   exec('code {{path}}')
	 * `);
	 * ```
	 */
	private handleJS(id: string, code: string): void {
		console.debug(`executing \`js\` action '${id}'.`);

		const scopedExec = (
			command: string,
			options?: ExecOptions | ExecCallback,
			callback?: ExecCallback
		) => this.execShellCommand(id, command, options, callback);

		/** Methods/variables accessible in the action */
		const methods: Record<string, unknown> = {
			app: this.app,
			vault: this.app.vault,
			workspace: this.app.workspace,
			metadataCache: this.app.metadataCache,
			fileManager: this.app.fileManager,
			Notice,
			Modal,
			Setting,
			FuzzySuggestModal,
			exec: scopedExec,
		};

		try {
			// Function constructor is required to execute user-defined JavaScript
			// code in a controlled environment with specific variables in scope
			const fn = Function(...Object.keys(methods), code);
			const result = fn(...Object.values(methods));

			void Promise.resolve(result)
				.then(() => {
					console.debug(`finished executing \`js\` action '${id}'`);
				})
				.catch(err => {
					console.error(`failed to execute \`js\` action '${id}', gave the following error ${String(err)}`);
				});
		} catch (err) {
			console.error(`failed to execute \`js\` action '${id}', gave the following error ${String(err)}`);
		}
	}

	/**
	 * Executes a given shell action.
	 *
	 * This method runs a in a plan shell with no environment/aliases.
	 * It captures and logs both `stdout` and `stderr` output, as well
	 * as any errors that occur during execution.
	 *
	 * @param {string} id id for the given command to execute, used for logging.
	 * @param {string} code actual code for the method to execute.
	 *
	 * @example
	 * ```ts
	 * this.handleShell('push-updates-to-git', `
	 *   git add .
	 *   git commit -m "update"
	 *   git push
	 * `);
	 * ```
	 */
	private handleShell(id: string, code: string): void {
		console.debug(`executing \`shell\` action '${id}'.`);

		this.execShellCommand(id, code);
	}

	private execShellCommand(id: string, code: string, options?: ExecOptions | ExecCallback, callback?: ExecCallback): ChildProcess {
		const execCallback: ExecCallback = (error, stdout, stderr) => {
			if (error) {
				console.error(`failed executing \`shell\` action '${id}', ${String(error.message)}`);
				callback?.(error, stdout, stderr);
				return;
			}

			if (stdout) {
				console.debug(`stdout from executing \`shell\` action '${stdout}`);
			}

			if (stderr) {
				console.error(`stderr: ${stderr}`);
			}

			callback?.(error, stdout, stderr);
		};

		const child = typeof options === 'function' ? exec(code, execCallback) : exec(code, options, execCallback);

		this.activeChildren.add(child);
		child.once('close', () => this.activeChildren.delete(child));
		child.once('error', () => this.activeChildren.delete(child));

		return child;
	}

	public async loadSettings(): Promise<ActionsSettings> {
		return Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	public async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
