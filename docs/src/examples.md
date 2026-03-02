# Examples

## Open Current File in VS Code

Use an absolute path to the `code` executable (shell aliases are not available
inside plugin execution contexts).

```sh
/path/to/vs/code/code "{{{path}}}"
```

## Compile LaTeX on Demand

JavaScript action:

```javascript
new Notice('compiling latex');

const COMPILE_SCRIPT = '/absolute/path/to/bash/script.sh';
const FILE_PATH = '{{{path}}}';

const PATH_PARTS = FILE_PATH.split('/');
const FILENAME = PATH_PARTS.pop();
const DIR = PATH_PARTS.join('/');

exec(`cd "/${DIR}" && "${COMPILE_SCRIPT}" "./${FILENAME}"`, (err, stdout, stderr) => {
  if (err) {
    console.error(err, stderr);
    new Notice('dang it, failed');
    return;
  }

  console.log('fin', stdout);
  new Notice('successfully compiled');
});
```

Shell script example:

```sh
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 /full/path/to/file.tex"
  exit 1
fi

FILEPATH="$1"
DIRECTORY="$(dirname "$FILEPATH")"
FILENAME="$(basename "$FILEPATH")"
FILENAMETEXT="${FILENAME%.*}"

export PATH="/path/to/tiny/tex"

cd "$DIRECTORY"

pdflatex --shell-escape -interaction=nonstopmode "$FILENAME"
bibtex "$FILENAMETEXT" || true
pdflatex --shell-escape -interaction=nonstopmode "$FILENAME"
pdflatex --shell-escape -interaction=nonstopmode "$FILENAME"
```
