# wxtools

> Turbo monorepo for a suite of reusable modules/plugins for WXT browser extension framework

A Django-inspired, schema-driven, typed, and consistent toolkit for building browser extensions with [WXT](https://wxt.dev/).

## 🏗️ Architecture

wxtools is a composable monorepo of specialized packages that follow unified `@wxtools/<area>` conventions:

- **Schema-first**: Define once, use everywhere (runtime, build-time, UI)
- **Type-safe**: Full TypeScript support across all boundaries
- **Deterministic**: Predictable codegen and build outputs
- **Composable**: Mix and match modules as needed

## 📦 Packages

### Core Packages

| Package | Description |
|---------|-------------|
| **[@wxtools/core](./packages/core)** | Base contracts, types, and interfaces for all modules |
| **[@wxtools/app](./packages/app)** | App composition and registry system (Django-inspired) |
| **[@wxtools/settings](./packages/settings)** | Schema-driven settings with UI and API generation |
| **[@wxtools/rpc](./packages/rpc)** | Type-safe RPC system for message passing |
| **[@wxtools/db](./packages/db)** | Schema-first database with migrations (IndexedDB) |
| **[@wxtools/templates](./packages/templates)** | Runtime and build-time template engine |
| **[@wxtools/cli](./packages/cli)** | Shared codegen CLI and tooling |

## 🚀 Quick Start

### Using the CLI

```bash
# Install globally
npm install -g @wxtools/cli

# Create a new extension
wxtools init my-extension
cd my-extension
npm install

# Generate a module
wxtools generate:module auth

# Start development
npm run dev
```

### Manual Setup

```bash
# Clone and install
git clone https://github.com/reedjones/wxtools.git
cd wxtools
pnpm install

# Build all packages
pnpm build

# Development mode
pnpm dev
```

## 💡 Usage Examples

### Module Registry (Django-inspired)

```typescript
import { registry, WXModule } from '@wxtools/app';
import type { ModuleContract } from '@wxtools/core';

@WXModule()
class AuthModule implements ModuleContract {
  id = 'auth';
  name = 'Authentication';
  version = '1.0.0';
  dependencies = ['storage'];

  async initialize() {
    console.log('Auth module initialized');
  }
}

await registry.initialize();
```

### Schema-Driven Settings

```typescript
import { SettingsSchema, SettingsManager, BrowserSettingsStorage } from '@wxtools/settings';

const schema: SettingsSchema = {
  id: 'app-settings',
  version: '1.0.0',
  fields: [
    {
      key: 'theme',
      type: 'select',
      label: 'Theme',
      default: 'light',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ],
      ui: { group: 'Appearance' },
    },
  ],
};

const settings = new SettingsManager(schema, new BrowserSettingsStorage('settings'));
await settings.set({ theme: 'dark' });
```

### Type-Safe RPC

```typescript
import { RPCServer, RPCClient, defineRPCMethod } from '@wxtools/rpc';

// Server (background)
const server = new RPCServer();
server.register(defineRPCMethod(
  'getUser',
  async (userId: string) => ({ id: userId, name: 'John' })
));
server.listen();

// Client (content/popup)
const client = new RPCClient();
const result = await client.call('getUser', 'user-123');
```

### Database with Migrations

```typescript
import { Database, TableSchema, createMigration } from '@wxtools/db';

interface User {
  id: string;
  name: string;
  email: string;
}

const userSchema: TableSchema<User> = {
  name: 'users',
  version: 1,
  columns: [
    { name: 'id', type: 'string', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'string', required: true, unique: true },
  ],
  primaryKey: 'id',
};

const db = new Database('my-db');
db.addMigration(createMigration(1, async (conn) => {
  // Migration logic
}));

await db.initialize();
const users = db.createTable(userSchema);
```

### Template-Based Codegen

```typescript
import { CodeGenerator } from '@wxtools/templates';

const generator = new CodeGenerator();

// Generate a module
const module = generator.generateModule({
  name: 'Storage Module',
  className: 'StorageModule',
  id: 'storage',
  version: '1.0.0',
});

// Generate background script
const background = generator.generateBackground({
  name: 'My Extension',
  modules: ['auth', 'storage', 'settings'],
});
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Development mode (watch)
pnpm dev

# Lint
pnpm lint

# Format
pnpm format

# Clean
pnpm clean
```

## 📚 Documentation

Each package has its own README with detailed documentation:

- [Core](./packages/core/README.md)
- [App](./packages/app/README.md)
- [Settings](./packages/settings/README.md)
- [RPC](./packages/rpc/README.md)
- [Database](./packages/db/README.md)
- [Templates](./packages/templates/README.md)
- [CLI](./packages/cli/README.md)

## 🏛️ Philosophy

### Django-Inspired Design

- **Apps/Modules**: Self-contained, reusable units
- **Registry**: Central module management with dependency resolution
- **Schema-Driven**: Define data structures once, use everywhere
- **Convention over Configuration**: Sensible defaults, easy customization

### Type Safety

- Full TypeScript support
- Runtime validation
- Schema-to-type generation
- Type-safe RPC and database operations

### Developer Experience

- Fast builds with Turborepo
- Hot module reload in development
- Automated code generation
- Clear, documented APIs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [reedjones](https://github.com/reedjones)

## 🔗 Links

- [WXT Framework](https://wxt.dev/)
- [Turborepo](https://turbo.build/)
- [TypeScript](https://www.typescriptlang.org/)
