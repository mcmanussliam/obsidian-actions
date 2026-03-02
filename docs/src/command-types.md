# Command Types

Actions support two execution modes.

## `js`

JavaScript actions run in a controlled environment with selected Obsidian APIs
and helpers.

Available objects/functions include:

- `app`
- `vault`
- `workspace`
- `metadataCache`
- `fileManager`
- `Notice`
- `Modal`
- `Setting`
- `FuzzySuggestModal`
- `exec`

Example:

```javascript
new Notice('Hello World');
console.log(app.vault.getFiles());
exec('echo "{{path}}"');
```

## `shell`

Shell actions run command text in a plain shell environment.

Example:

```sh
git add .
git commit -m "Update"
git push
```
