/**
 * Memory Bank Webview Provider
 * 
 * This module provides a webview for the Memory Bank UI that injects
 * the MCP storage adapter to replace localStorage.
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * MemoryBankWebviewProvider class manages the webview panel for the Memory Bank UI
 */
export class MemoryBankWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'memoryBankView';
  private _view?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;

  /**
   * Constructor
   * 
   * @param extensionUri The URI of the extension
   */
  constructor(extensionUri: vscode.Uri) {
    this._extensionUri = extensionUri;
  }

  /**
   * Resolve the webview view
   * 
   * @param webviewView The webview view to resolve
   * @param context The webview view context
   * @param token A cancellation token
   */
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    this._view = webviewView;

    // Set the webview options
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'media'),
        vscode.Uri.joinPath(this._extensionUri, 'dist')
      ]
    };

    // Set the HTML content
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'alert':
            vscode.window.showInformationMessage(message.text);
            return;
          case 'log':
            console.log(message.text);
            return;
          case 'error':
            console.error(message.text);
            return;
        }
      },
      undefined,
      []
    );
  }

  /**
   * Get the HTML content for the webview
   * 
   * @param webview The webview
   * @returns The HTML content
   */
  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Get the local path to the script file
    const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js');
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    // Get the local path to the CSS file
    const stylePathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css');
    const styleUri = webview.asWebviewUri(stylePathOnDisk);

    // Get the content security policy
    const nonce = this._getNonce();

    // Create the storage adapter script
    const storageAdapterScript = `
      <script nonce="${nonce}">
        // Create a proxy for localStorage that uses the MCP client
        const vscode = acquireVsCodeApi();
        
        // Override localStorage with our MCP-backed implementation
        const originalLocalStorage = window.localStorage;
        
        // Create a proxy object that will intercept localStorage calls
        window.localStorage = new Proxy({}, {
          get: function(target, prop) {
            if (prop === 'setItem') {
              return function(key, value) {
                // Send the setItem call to the extension
                vscode.postMessage({
                  command: 'storage',
                  action: 'setItem',
                  key: key,
                  value: value
                });
                
                // Also update the original localStorage for backwards compatibility
                originalLocalStorage.setItem(key, value);
              };
            } else if (prop === 'getItem') {
              return function(key) {
                // Send the getItem call to the extension
                vscode.postMessage({
                  command: 'storage',
                  action: 'getItem',
                  key: key
                });
                
                // Return from the original localStorage for backwards compatibility
                return originalLocalStorage.getItem(key);
              };
            } else if (prop === 'removeItem') {
              return function(key) {
                // Send the removeItem call to the extension
                vscode.postMessage({
                  command: 'storage',
                  action: 'removeItem',
                  key: key
                });
                
                // Also update the original localStorage for backwards compatibility
                originalLocalStorage.removeItem(key);
              };
            } else if (prop === 'clear') {
              return function() {
                // Send the clear call to the extension
                vscode.postMessage({
                  command: 'storage',
                  action: 'clear'
                });
                
                // Also update the original localStorage for backwards compatibility
                originalLocalStorage.clear();
              };
            } else {
              // For other properties, use the original localStorage
              return originalLocalStorage[prop];
            }
          }
        });
        
        // Log that we've overridden localStorage
        console.log('localStorage has been overridden with MCP-backed implementation');
      </script>
    `;

    // Return the HTML content
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <link href="${styleUri}" rel="stylesheet">
        <title>Memory Bank</title>
      </head>
      <body>
        <div id="app">
          <h1>Memory Bank</h1>
          <p>Loading Memory Bank UI...</p>
        </div>
        ${storageAdapterScript}
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }

  /**
   * Generate a nonce for the content security policy
   * 
   * @returns A random nonce
   */
  private _getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
