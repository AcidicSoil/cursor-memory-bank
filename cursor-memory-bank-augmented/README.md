# Cursor Memory Probe

A VS Code extension that provides MCP (Model Context Protocol) memory server functionality for Cursor and other MCP-compatible agents like Augment.

## Features

- Exposes a lightweight MCP "memory" server that both Cursor's native agent and Augment can call
- Provides a simple UI to view active webviews
- Implements `remember` and `recall` methods for key-value storage

## Getting Started

### Prerequisites

- VS Code 1.90.0 or higher
- Node.js 14.0.0 or higher
- npm 6.0.0 or higher

### Installation

1. Clone this repository
2. Navigate to the extension directory:
   ```bash
   cd cursor-memory-bank-augmented
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Compile the extension:
   ```bash
   npm run compile
   ```
5. Launch the Extension Development Host:
   - Press F5 in VS Code

### Configuration

To enable Cursor to use the MCP server, add the following to your Cursor settings:

```jsonc
{
  "mcpServers": {
    "memory-probe": { 
      "command": "node", 
      "args": ["<absolute-path-to>/dist/memoryServer.js"] 
    }
  }
}
```

Replace `<absolute-path-to>` with the absolute path to your extension's `dist` directory.

## Usage

Once the extension is running, Cursor (and any extension that supports MCP, e.g., Augment's Agent) will list "memory-probe" in _Available Tools_ and can use the following methods:

- `call.memory-probe.remember` - Store a key-value pair
- `call.memory-probe.recall` - Retrieve a value by key

### Example Usage

In Cursor or Augment, you can use:

```
Please remember the key "hello" with value "world" using the memory-probe tool.
```

And later:

```
Please recall the value for key "hello" using the memory-probe tool.
```

## Roadmap

1. **Wire the Memory-Bank UI** to use the new MCP server (replace direct storage calls with `call.memory-probe.remember/recall`)
2. **Smoke-test with Augment** to confirm the server logs and Augment's response match
3. **Persist data** by replacing the in-memory Map with SQLite or a lightweight JSON DB
4. **Package the extension** for distribution

## License

[MIT](LICENSE)