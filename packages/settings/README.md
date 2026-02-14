# @wxtools/settings

Schema-driven settings with UI and API generation for WXT browser extensions.

## Features

- Type-safe settings management
- Schema-based field definitions
- Built-in validation
- Browser storage integration
- UI metadata for automatic form generation
- Field grouping and ordering
- Conditional field visibility

## Usage

```typescript
import { SettingsSchema, SettingsManager, BrowserSettingsStorage } from '@wxtools/settings';

// Define settings schema
const schema: SettingsSchema<AppSettings> = {
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
      ui: { group: 'Appearance', order: 1 },
    },
    {
      key: 'apiKey',
      type: 'string',
      label: 'API Key',
      validation: [{ type: 'required', message: 'API key is required' }],
      ui: { group: 'API', order: 2 },
    },
  ],
};

// Create settings manager
const storage = new BrowserSettingsStorage('my-app-settings');
const settings = new SettingsManager(schema, storage);

// Get/set values
const theme = await settings.getValue('theme');
await settings.set({ theme: 'dark' });

// For UI generation
const fields = settings.getFieldsByGroup();
```

## License

MIT
