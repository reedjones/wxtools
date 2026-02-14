# @wxtools/app

App composition and registry system for WXT browser extensions.

## Features

- Module registry with dependency resolution
- Topological sorting for initialization order
- Lifecycle management (initialize/destroy)
- Decorator-based module registration
- Django-inspired architecture

## Usage

```typescript
import { ModuleRegistry, WXModule } from '@wxtools/app';
import type { ModuleContract } from '@wxtools/core';

// Define a module
@WXModule()
class MyModule implements ModuleContract {
  id = 'my-module';
  name = 'My Module';
  version = '1.0.0';
  
  async initialize() {
    console.log('Module initialized');
  }
}

// Or register manually
import { registry } from '@wxtools/app';

const myModule: ModuleContract = {
  id: 'my-module',
  name: 'My Module',
  version: '1.0.0',
};

registry.register(myModule);
await registry.initialize();
```

## License

MIT
