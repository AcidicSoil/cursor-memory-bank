import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { MemoryBankWebviewProvider } from './memoryBankWebview';
import { MCPClient, remember, recall } from './mcpClient';
import { mcpStorage, mcpStorageSync } from './storageAdapter';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log('Cursor Memory Probe extension is now active!');

  // 1️⃣ Create a simple view to list active webviews
  const webviewsProvider = new WebviewsTreeDataProvider();
  vscode.window.registerTreeDataProvider('memoryProbeView', webviewsProvider);

  // Refresh the webviews list every 5 seconds
  setInterval(() => {
    webviewsProvider.refresh();
  }, 5000);

  // 2️⃣ Register the Memory Bank webview provider
  const memoryBankProvider = new MemoryBankWebviewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      MemoryBankWebviewProvider.viewType,
      memoryBankProvider
    )
  );

  // 3️⃣ Register commands for MCP storage operations
  context.subscriptions.push(
    vscode.commands.registerCommand('cursor-memory-probe.remember', async (key: string, value: string) => {
      await remember(key, value);
      return { success: true };
    }),
    vscode.commands.registerCommand('cursor-memory-probe.recall', async (key: string) => {
      return await recall(key);
    })
  );

  // 4️⃣ Start the MCP "memory" server (stdio) when Cursor asks
  const mcpServerPath = path.join(context.extensionPath, 'dist', 'memoryServer.js');
  const mcpServer = spawn('node', [mcpServerPath], {
    stdio: ['inherit', 'inherit', 'inherit']
  });

  console.log('MCP Memory Server started');

  // Make sure to kill the server when the extension is deactivated
  context.subscriptions.push({
    dispose: () => {
      console.log('Shutting down MCP Memory Server');
      mcpServer.kill();
    }
  });

  // Create media directory if it doesn't exist
  const mediaDir = path.join(context.extensionPath, 'media');
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir);
  }

  // Create a basic CSS file for the webview if it doesn't exist
  const cssFile = path.join(mediaDir, 'styles.css');
  if (!fs.existsSync(cssFile)) {
    fs.writeFileSync(cssFile, `
      body {
        font-family: var(--vscode-font-family);
        color: var(--vscode-foreground);
        background-color: var(--vscode-editor-background);
        padding: 10px;
      }
      h1 {
        color: var(--vscode-editor-foreground);
        font-size: 1.5em;
      }
      button {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        padding: 5px 10px;
        cursor: pointer;
        margin: 5px 0;
      }
      button:hover {
        background-color: var(--vscode-button-hoverBackground);
      }
    `);
  }
}

// This method is called when your extension is deactivated
export function deactivate() {
  console.log('Cursor Memory Probe extension has been deactivated');
}

// Simple TreeDataProvider to list active webviews
class WebviewsTreeDataProvider implements vscode.TreeDataProvider<WebviewItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<WebviewItem | undefined | null | void> = new vscode.EventEmitter<WebviewItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<WebviewItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: WebviewItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: WebviewItem): Promise<WebviewItem[]> {
    if (element) {
      return [];
    }

    // In a real implementation, we would scan for active webviews here
    // For now, just return a placeholder item
    return [
      new WebviewItem(
        'Memory Probe Server',
        'Active',
        vscode.TreeItemCollapsibleState.None
      )
    ];
  }
}

class WebviewItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly status: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label} - ${this.status}`;
    this.description = this.status;
  }
}