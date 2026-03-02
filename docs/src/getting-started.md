# Getting Started

## Install

### Community Plugins (Default)

1. Open Obsidian.
2. Go to `Settings -> Community Plugins -> Browse`.
3. Search for `Obsidian Actions`.
4. Install and enable the plugin.

### Manual Install

Copy these files into:
`<vault>/.obsidian/plugins/actions`

- `main.js`
- `styles.css`
- `manifest.json`

Then enable `Obsidian Actions` in Community Plugins settings.

### Developer Setup

```bash
git clone https://github.com/mcmanussliam/obsidian-actions.git
cd obsidian-actions
npm ci
npm run dev
```

Symlink the repo into your vault plugins folder so Obsidian loads your local
build while you develop.

## Create Your First Action

1. Open `Settings -> Actions`.
2. Click `Create`.
3. Configure:

- `name`: display name and ID seed
- `icon`: Lucide icon name
- `description`: optional helper text
- `hook`: when it runs (`manual`, `startup`, `interval`, or file events)
- `type`: `js` or `shell`
- `code`: script/command body
- `schedule`: cron expression (required for `interval`)

4. Save.

Manual actions can be run directly from settings or command palette.
