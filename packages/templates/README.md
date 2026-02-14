# @wxtools/templates

Runtime and build templates for WXT browser extensions.

## Features

- Template engine with variable interpolation
- Control flow (if/each)
- Helper functions
- Pre-built templates for common files
- Code generation utilities

## Usage

```typescript
import { createTemplateEngine, templates, CodeGenerator } from '@wxtools/templates';

// Use template engine directly
const engine = createTemplateEngine();
const result = engine.render('Hello {{name}}!', { name: 'World' });

// Use code generator
const generator = new CodeGenerator();
const backgroundScript = generator.generateBackground({
  name: 'My Extension',
  modules: ['auth', 'storage'],
});

const module = generator.generateModule({
  name: 'Auth Module',
  className: 'AuthModule',
  id: 'auth',
  version: '1.0.0',
});
```

## Templates

- `background` - Background script with module loading
- `content` - Content script boilerplate
- `popup` - Popup HTML
- `module` - Module class template

## License

MIT
