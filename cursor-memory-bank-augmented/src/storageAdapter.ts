/**
 * Storage Adapter
 * 
 * This module provides a localStorage-like interface that uses the MCP client
 * for storage operations. It's designed to be a drop-in replacement for
 * localStorage in the Memory Bank UI.
 */

import { remember, recall } from './mcpClient';

/**
 * MCPStorageAdapter class provides a localStorage-like interface
 * that uses the MCP client for storage operations.
 */
export class MCPStorageAdapter {
  private static instance: MCPStorageAdapter;
  private cache: Map<string, string> = new Map();

  /**
   * Get the singleton instance of MCPStorageAdapter
   */
  public static getInstance(): MCPStorageAdapter {
    if (!MCPStorageAdapter.instance) {
      MCPStorageAdapter.instance = new MCPStorageAdapter();
    }
    return MCPStorageAdapter.instance;
  }

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Set a key-value pair in storage
   * 
   * @param key The key to store
   * @param value The value to store
   */
  public async setItem(key: string, value: string): Promise<void> {
    // Update the local cache
    this.cache.set(key, value);
    
    // Store in MCP server
    await remember(key, value);
  }

  /**
   * Get a value from storage by key
   * 
   * @param key The key to retrieve
   * @returns The stored value, or null if not found
   */
  public async getItem(key: string): Promise<string | null> {
    // Check the local cache first
    if (this.cache.has(key)) {
      return this.cache.get(key) || null;
    }
    
    // Retrieve from MCP server
    const value = await recall(key);
    
    // Update the local cache if a value was found
    if (value !== null) {
      this.cache.set(key, value);
    }
    
    return value;
  }

  /**
   * Remove an item from storage
   * 
   * @param key The key to remove
   */
  public async removeItem(key: string): Promise<void> {
    // Remove from the local cache
    this.cache.delete(key);
    
    // Store null in MCP server to indicate removal
    await remember(key, '');
  }

  /**
   * Clear all items from storage
   */
  public async clear(): Promise<void> {
    // Clear the local cache
    this.cache.clear();
    
    // Store a special key to indicate clearing
    await remember('__mcp_storage_cleared__', Date.now().toString());
  }

  /**
   * Get the number of items in storage
   * 
   * @returns The number of items in the local cache
   */
  public get length(): number {
    return this.cache.size;
  }

  /**
   * Get the key at the specified index
   * 
   * @param index The index of the key to retrieve
   * @returns The key at the specified index, or null if not found
   */
  public key(index: number): string | null {
    const keys = Array.from(this.cache.keys());
    return index >= 0 && index < keys.length ? keys[index] : null;
  }
}

/**
 * Create a global storage adapter instance that can be used as a drop-in
 * replacement for localStorage in the Memory Bank UI.
 */
export const mcpStorage = MCPStorageAdapter.getInstance();

/**
 * Synchronous versions of the storage methods for compatibility with existing code
 * These methods will log warnings when used, as they're not truly synchronous.
 */
export const mcpStorageSync = {
  setItem: (key: string, value: string): void => {
    console.warn('Using synchronous setItem with async MCP storage - this may cause race conditions');
    mcpStorage.setItem(key, value).catch(err => console.error('Error in setItem:', err));
  },
  
  getItem: (key: string): string | null => {
    console.warn('Using synchronous getItem with async MCP storage - this may return stale data');
    // Return from cache only in the sync version
    return mcpStorage['cache'].get(key) || null;
  },
  
  removeItem: (key: string): void => {
    console.warn('Using synchronous removeItem with async MCP storage - this may cause race conditions');
    mcpStorage.removeItem(key).catch(err => console.error('Error in removeItem:', err));
  },
  
  clear: (): void => {
    console.warn('Using synchronous clear with async MCP storage - this may cause race conditions');
    mcpStorage.clear().catch(err => console.error('Error in clear:', err));
  },
  
  get length(): number {
    return mcpStorage.length;
  },
  
  key: (index: number): string | null => {
    return mcpStorage.key(index);
  }
};
