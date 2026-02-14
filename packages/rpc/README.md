# @wxtools/rpc

Typed RPC system for WXT browser extensions with message passing.

## Features

- Type-safe RPC method definitions
- Client-server architecture
- Input validation
- Browser extension message integration
- Context-aware handlers
- Decorator-based method registration

## Usage

```typescript
import { RPCServer, RPCClient, defineRPCMethod } from '@wxtools/rpc';

// Define RPC methods
const getUserMethod = defineRPCMethod(
  'getUser',
  async (userId: string) => {
    return { id: userId, name: 'John Doe' };
  }
);

// Server (background script)
const server = new RPCServer();
server.register(getUserMethod);
server.listen();

// Client (content script/popup)
const client = new RPCClient();
const result = await client.call('getUser', 'user-123');

if (result.ok) {
  console.log(result.value);
}
```

## License

MIT
