# Hooks

Hooks decide when an action executes.

| Hook | Behavior |
|---|---|
| `manual` | Runs only when manually triggered. |
| `startup` | Runs when Obsidian starts. |
| `interval` | Runs on a cron schedule. |
| `createFile` | Runs when a file is created. |
| `modifyFile` | Runs when a file is modified. |
| `deleteFile` | Runs when a file is deleted. |
| `renameFile` | Runs when a file is renamed. |

## `interval` Hook

`interval` actions require a valid cron expression (for example `* * * * *`).

Use <https://crontab.guru/examples.html> to test schedules.
