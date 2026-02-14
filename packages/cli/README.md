# @wxtools/cli

Shared codegen CLI and tooling for WXT browser extensions.

## Features

- Project initialization
- Module generation
- Background script generation
- Code scaffolding
- Template-based code generation

## Installation

```bash
npm install -g @wxtools/cli
```

## Usage

### Initialize a new project

```bash
wxtools init my-extension
cd my-extension
npm install
```

### Generate a module

```bash
wxtools generate:module auth
```

### Generate background script

```bash
wxtools generate:background auth storage
```

## Commands

- `init <name>` - Initialize a new WXT extension project
- `generate:module <name>` - Generate a new module
- `generate:background <modules...>` - Generate background script with modules

## License

MIT
