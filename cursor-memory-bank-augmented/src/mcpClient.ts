/**
 * MCP Client Wrapper
 * 
 * This module provides a client-side wrapper for the MCP memory server.
 * It replaces direct localStorage calls with MCP protocol calls to the memory-probe server.
 */

import * as vscode from 'vscode';

/**
 * MCPClient class provides methods to interact with the MCP memory server
 * using the remember and recall functions.
 */
export class MCPClient {
  private static instance: MCPClient;
  private callCounter: number = 0;

  /**
   * Get the singleton instance of MCPClient
   */
  public static getInstance(): MCPClient {
    if (!MCPClient.instance) {
      MCPClient.instance = new MCPClient();
    }
    return MCPClient.instance;
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Generate a unique ID for each MCP call
   */
  private generateCallId(): string {
    return `call-${Date.now()}-${this.callCounter++}`;
  }

  /**
   * Remember a key-value pair using the MCP memory server
   * 
   * @param key The key to store
   * @param value The value to store
   * @returns A promise that resolves when the operation is complete
   */
  public async remember(key: string, value: string): Promise<void> {
    try {
      // Log the operation
      console.log(`MCPClient: Storing ${key}=${value}`);

      // Create the MCP call
      const callId = this.generateCallId();
      const call = {
        id: callId,
        method: 'remember',
        params: { key, value }
      };

      // Execute the MCP call
      await this.executeMCPCall(call);

      console.log(`MCPClient: Successfully stored ${key}=${value}`);
    } catch (error) {
      console.error(`MCPClient: Error storing ${key}=${value}`, error);
      throw error;
    }
  }

  /**
   * Recall a value by key from the MCP memory server
   * 
   * @param key The key to retrieve
   * @returns A promise that resolves to the stored value, or null if not found
   */
  public async recall(key: string): Promise<string | null> {
    try {
      // Log the operation
      console.log(`MCPClient: Retrieving value for ${key}`);

      // Create the MCP call
      const callId = this.generateCallId();
      const call = {
        id: callId,
        method: 'recall',
        params: { key }
      };

      // Execute the MCP call and get the result
      const result = await this.executeMCPCall(call);

      console.log(`MCPClient: Retrieved ${key}=${result}`);
      return result;
    } catch (error) {
      console.error(`MCPClient: Error retrieving ${key}`, error);
      throw error;
    }
  }

  /**
   * Execute an MCP call using the VS Code API
   * 
   * @param call The MCP call object
   * @returns A promise that resolves to the result of the call
   */
  private async executeMCPCall(call: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // Use the VS Code API to execute the MCP call
      vscode.commands.executeCommand('cursor.mcp.call', 'memory-probe', call.method, call.params)
        .then((response: any) => {
          if (response.error) {
            reject(new Error(`MCP call failed: ${response.error.message}`));
          } else {
            resolve(response.result);
          }
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }
}

/**
 * Convenience functions for using the MCP client
 */

/**
 * Remember a key-value pair using the MCP memory server
 * 
 * @param key The key to store
 * @param value The value to store
 * @returns A promise that resolves when the operation is complete
 */
export async function remember(key: string, value: string): Promise<void> {
  return MCPClient.getInstance().remember(key, value);
}

/**
 * Recall a value by key from the MCP memory server
 * 
 * @param key The key to retrieve
 * @returns A promise that resolves to the stored value, or null if not found
 */
export async function recall(key: string): Promise<string | null> {
  return MCPClient.getInstance().recall(key);
}
