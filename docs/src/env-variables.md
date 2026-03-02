# Environment Variables

Actions expose runtime variables from the active vault, file, editor, and
execution context.

Use Mustache templates in your code:

```sh
echo "Processing {{file_name}} at {{time}}"
```

## Variables

| Variable | Description |
|---|---|
| `path` | Absolute file path. |
| `relative_path` | Path relative to vault root. |
| `extension` | File extension. |
| `readonly` | Whether editor is read-only. |
| `selected` | Selected editor text. |
| `selected_lower` | Lowercased selected text. |
| `selected_upper` | Uppercased selected text. |
| `length_selected` | Selected text length. |
| `word_count` | Word count for file or selection. |
| `line_index` | Cursor line index (0-based). |
| `column_index` | Cursor column index. |
| `vault_name` | Vault name. |
| `file_name` | Filename without extension. |
| `file_name_with_ext` | Filename with extension. |
| `content` | Full file content. |
| `content_length` | Content length. |
| `timestamp` | ISO timestamp for execution time. |
| `date` | Human-readable date. |
| `time` | Human-readable time. |
| `hello_world` | Test variable for experimentation. |

Mustache reference: <https://mustache.github.io/>
