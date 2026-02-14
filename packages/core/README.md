# @wxtools/core

Core contracts and types for WXT browser extension modules.

## Features

- Base module contracts
- Schema definitions
- Type utilities
- Validation rules
- Result types
- Event emitter interfaces
- Lifecycle hooks

## Usage

```typescript
import { ModuleContract, SchemaDefinition, Result } from '@wxtools/core';

// Implement a module
class MyModule implements ModuleContract {
  id = 'my-module';
  name = 'My Module';
  version = '1.0.0';
  
  async initialize() {
    // Initialize logic
  }
}
```

## License

MIT
