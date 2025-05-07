# Memory Bank MCP Client

This document provides instructions for using the MCP client in your Memory Bank UI code.

## Overview

The Memory Bank MCP client provides a way to store and retrieve key-value pairs using the MCP (Model Context Protocol) server instead of localStorage. This allows your Memory Bank UI to work with Cursor and other MCP-compatible agents like Augment.

## Using the MCP Client

### Direct API Usage

You can use the MCP client directly in your code:

```typescript
import { remember, recall } from './mcpClient';

// Store a key-value pair
await remember('myKey', 'myValue');

// Retrieve a value by key
const value = await recall('myKey');
console.log(value); // 'myValue' or null if not found
```

### Storage Adapter

For easier integration with existing code that uses localStorage, you can use the storage adapter:

```typescript
import { mcpStorage, mcpStorageSync } from './storageAdapter';

// Async API (recommended)
await mcpStorage.setItem('myKey', 'myValue');
const value = await mcpStorage.getItem('myKey');
await mcpStorage.removeItem('myKey');
await mcpStorage.clear();

// Sync API (for compatibility with existing code)
mcpStorageSync.setItem('myKey', 'myValue');
const syncValue = mcpStorageSync.getItem('myKey');
mcpStorageSync.removeItem('myKey');
mcpStorageSync.clear();
```

### Webview Integration

In the Memory Bank webview, localStorage is automatically proxied to use the MCP client. This means you can continue to use localStorage in your webview code, and it will automatically use the MCP client under the hood:

```javascript
// In webview code
localStorage.setItem('myKey', 'myValue');
const value = localStorage.getItem('myKey');
localStorage.removeItem('myKey');
localStorage.clear();
```

## API Reference

### MCPClient

The `MCPClient` class provides methods to interact with the MCP memory server.

#### Methods

- `remember(key: string, value: string): Promise<void>` - Store a key-value pair
- `recall(key: string): Promise<string | null>` - Retrieve a value by key

### MCPStorageAdapter

The `MCPStorageAdapter` class provides a localStorage-like interface that uses the MCP client.

#### Methods

- `setItem(key: string, value: string): Promise<void>` - Store a key-value pair
- `getItem(key: string): Promise<string | null>` - Retrieve a value by key
- `removeItem(key: string): Promise<void>` - Remove a key-value pair
- `clear(): Promise<void>` - Clear all key-value pairs
- `key(index: number): string | null` - Get the key at the specified index
- `length: number` - Get the number of key-value pairs

## Best Practices

1. **Use Async API**: Whenever possible, use the async API (`mcpStorage`) instead of the sync API (`mcpStorageSync`).
2. **Error Handling**: Always handle errors when using the MCP client.
3. **Caching**: The storage adapter includes a local cache to improve performance, but be aware that it may not always be in sync with the MCP server.
4. **Key Naming**: Use descriptive key names to avoid conflicts with other extensions.

## Example: Converting Existing Code

### Before (using localStorage)

```javascript
// Store a value
localStorage.setItem('myKey', 'myValue');

// Retrieve a value
const value = localStorage.getItem('myKey');

// Remove a value
localStorage.removeItem('myKey');
```

### After (using MCP client)

```typescript
import { mcpStorage } from './storageAdapter';

// Store a value
await mcpStorage.setItem('myKey', 'myValue');

// Retrieve a value
const value = await mcpStorage.getItem('myKey');

// Remove a value
await mcpStorage.removeItem('myKey');
```

## Troubleshooting

If you encounter issues with the MCP client, check the following:

1. Make sure the MCP server is running.
2. Check the extension logs for error messages.
3. Verify that the key and value are valid strings.
4. Try using the direct API (`remember` and `recall`) to bypass the storage adapter.

## Contributing

If you find bugs or have suggestions for improvements, please open an issue or submit a pull request on the GitHub repository.
