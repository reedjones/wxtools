# @wxtools/db

Schema-first database with migrations for WXT browser extensions using IndexedDB.

## Features

- Type-safe database operations
- Schema-based table definitions
- Migration system
- IndexedDB abstraction
- CRUD operations
- Query building

## Usage

```typescript
import { Database, TableSchema, createMigration } from '@wxtools/db';

// Define schema
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

// Initialize database
const db = new Database('my-extension-db');

// Add migration
db.addMigration(
  createMigration(1, async (conn) => {
    // Create tables
  })
);

await db.initialize();

// Use table
const users = db.createTable(userSchema);
await users.insert({ id: '1', name: 'John', email: 'john@example.com' });
const allUsers = await users.find();
```

## License

MIT
