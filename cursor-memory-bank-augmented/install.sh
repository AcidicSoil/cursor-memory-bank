#!/bin/bash

echo "Installing Cursor Memory Probe extension..."
echo

echo "Step 1: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies."
    exit 1
fi
echo "Dependencies installed successfully."
echo

echo "Step 2: Compiling TypeScript..."
npm run compile
if [ $? -ne 0 ]; then
    echo "Error: Failed to compile TypeScript."
    exit 1
fi
echo "TypeScript compiled successfully."
echo

echo "Step 3: Running tests..."
npm run test
if [ $? -ne 0 ]; then
    echo "Error: Tests failed."
    exit 1
fi
echo "Tests completed successfully."
echo

echo "Installation completed successfully!"
echo
echo "To launch the extension in VS Code:"
echo "1. Open VS Code"
echo "2. Open this folder (cursor-memory-bank-augmented)"
echo "3. Press F5 to launch the Extension Development Host"
echo
echo "To configure Cursor to use the MCP server:"
echo "1. Open Cursor"
echo "2. Go to Settings -> MCP"
echo "3. Add the following configuration:"
echo
echo "{"
echo "  \"mcpServers\": {"
echo "    \"memory-probe\": { \"command\": \"node\", \"args\": [\"$(pwd)/dist/memoryServer.js\"] }"
echo "  }"
echo "}"
echo
echo "Thank you for using Cursor Memory Probe!"