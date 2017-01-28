# CrossTS

Generates crosshub.json files for the [CrossHub Chrome Extension](https://github.com/astashov/crosshub-chrome-extension)

## Installation

```bash
$ npm install -g crossts
```

## Usage

```bash
$ crossts path/to/file.ts path/to/another_file.ts ... > crosshub.json
```

If you want to e.g. feed all files from `test` and `src` directories, you could use `find`:

```bash
$ find src test \( -name "*.ts" -o -name "*.tsx" \) -type f -exec crossts {} + > crosshub.json
```
