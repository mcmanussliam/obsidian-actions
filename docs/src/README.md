# Obsidian Actions

`obsidian-actions` is an Obsidian plugin for defining custom automation with
JavaScript or shell commands.

You can trigger actions manually, on startup, on file lifecycle events, or on a
schedule.

## How It Works

1. You create an action in plugin settings.
2. You choose a hook (`manual`, `startup`, `interval`, or file events).
3. You choose an action type (`js` or `shell`).
4. The plugin resolves context variables (for example file path, selected text,
and timestamps).
5. Your script/command executes with that context.

## Why Use It

- You can automate vault workflows without building a full Obsidian plugin.
- You can compose existing CLI tools/scripts into Obsidian-native flows.
- You keep full control over your own automation logic.
