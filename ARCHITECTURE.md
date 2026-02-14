# wxtools Architecture

## Overview

wxtools is a Turborepo-based monorepo containing a suite of reusable modules for building browser extensions with the WXT framework. The architecture is inspired by Django's app system, emphasizing schema-driven development, type safety, and code generation.

## Monorepo Structure

```
wxtools/
├── packages/
│   ├── core/          # Base contracts and types
│   ├── app/           # Module registry and composition
│   ├── settings/      # Schema-driven settings management
│   ├── rpc/           # Type-safe RPC system
│   ├── db/            # IndexedDB with migrations
│   ├── templates/     # Code generation templates
│   └── cli/           # Command-line tooling
├── package.json       # Root package configuration
├── pnpm-workspace.yaml # Workspace configuration
├── turbo.json         # Turborepo pipeline
├── tsconfig.json      # TypeScript base config
└── eslint.config.js   # ESLint configuration
```

## Core Principles

### 1. Schema-Driven Development

All data structures are defined using schemas that drive:
- Runtime validation
- UI generation
- Type definitions
- Database migrations
- API contracts

### 2. Type Safety

- Full TypeScript coverage
- Strict mode enabled
- Runtime type checking via schemas
- Type-safe RPC calls
- Generic type parameters for flexibility

### 3. Composability

- Small, focused packages
- Clear dependency relationships
- Workspace protocol for inter-package deps
- Plugin-style architecture

### 4. Code Generation

- Template-based scaffolding
- Deterministic output
- Convention over configuration
- CLI tooling for automation

## Package Details

### @wxtools/core

**Purpose**: Foundation for all other packages

**Exports**:
- `ModuleContract` - Interface for modules
- `SchemaDefinition` - Schema type definitions
- `ValidationRule` - Validation rules
- `Result<T, E>` - Type-safe result handling
- `TypedEventEmitter` - Event system
- Utility types (DeepPartial, etc.)

### @wxtools/app

**Purpose**: Module composition and lifecycle management

**Key Features**:
- Module registry with dependency resolution
- Topological sorting for initialization
- Lifecycle hooks (onBeforeInit, etc.)
- Decorator-based registration (`@WXModule`)

**Django Inspiration**:
- Similar to Django's `INSTALLED_APPS`
- Automatic dependency ordering
- Centralized configuration

### @wxtools/settings

**Purpose**: Schema-driven settings with validation

**Key Features**:
- Type-safe settings access
- Browser storage integration
- Field-level validation
- UI metadata for form generation
- Field grouping and ordering

**Use Cases**:
- Extension preferences
- User configurations
- Feature flags

### @wxtools/rpc

**Purpose**: Type-safe communication between extension contexts

**Key Features**:
- Client-server architecture
- Browser message integration
- Input validation
- Context-aware handlers

**Use Cases**:
- Background ↔ content script communication
- Popup ↔ background communication
- Cross-context type safety

### @wxtools/db

**Purpose**: Typed database operations with migrations

**Key Features**:
- IndexedDB abstraction
- Migration system
- Type-safe CRUD operations
- Schema-based table definitions

**Use Cases**:
- Persistent extension data
- Offline storage
- Structured data management

### @wxtools/templates

**Purpose**: Code generation engine

**Key Features**:
- Template interpolation
- Control flow (if/each)
- Helper functions
- Pre-built templates

**Use Cases**:
- Scaffolding modules
- Generating boilerplate
- Build-time code generation

### @wxtools/cli

**Purpose**: Command-line tooling

**Commands**:
- `init` - Create new extension
- `generate:module` - Generate module
- `generate:background` - Generate background script

## Dependency Graph

```
cli → templates → core
app → core
settings → core
rpc → core
db → core
```

## Build Pipeline

Turborepo orchestrates the following tasks:

1. **build**: Compile TypeScript to ESM/CJS
2. **lint**: Run ESLint on all packages
3. **dev**: Watch mode for development
4. **clean**: Remove build artifacts

### Build Order

Turborepo automatically determines build order based on dependencies:

```
core → (app, settings, rpc, db) → templates → cli
```

## Type System

### Module Contract

All modules implement `ModuleContract`:

```typescript
interface ModuleContract {
  id: string;
  name: string;
  version: string;
  dependencies?: string[];
  initialize?(): Promise<void>;
  destroy?(): Promise<void>;
}
```

### Schema Definitions

Schemas drive validation and types:

```typescript
interface SchemaDefinition<T> {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  default?: T;
  validation?: ValidationRule[];
}
```

## Extension Points

### Custom Modules

Create modules by implementing `ModuleContract`:

```typescript
@WXModule()
class CustomModule implements ModuleContract {
  id = 'custom';
  name = 'Custom Module';
  version = '1.0.0';
  
  async initialize() {
    // Init logic
  }
}
```

### Custom Templates

Add templates to the engine:

```typescript
const engine = createTemplateEngine();
engine.registerHelper('custom', (arg) => {
  // Helper logic
});
```

### Custom RPC Methods

Define type-safe RPC methods:

```typescript
const method = defineRPCMethod(
  'methodName',
  async (input: InputType) => {
    return { /* output */ };
  }
);
```

## Best Practices

1. **Keep modules focused**: Each module should have a single responsibility
2. **Use schemas**: Define data structures as schemas for consistency
3. **Leverage types**: Use TypeScript's type system fully
4. **Test thoroughly**: Write tests for core functionality
5. **Document APIs**: Keep README files up to date
6. **Version carefully**: Follow semver for packages

## Development Workflow

1. Install dependencies: `pnpm install`
2. Build all packages: `pnpm build`
3. Watch for changes: `pnpm dev`
4. Lint code: `pnpm lint`
5. Format code: `pnpm format`

## Future Enhancements

- [ ] Add comprehensive test suite
- [ ] Add example extension project
- [ ] Add more template types
- [ ] Add documentation generator
- [ ] Add migration tooling
- [ ] Add debugging utilities

## Contributing

See individual package READMEs for specific contribution guidelines.
