/**
 * Memory Bank Webview Script
 * 
 * This script is loaded in the Memory Bank webview and provides the UI
 * for interacting with the Memory Bank.
 */

// Get the VS Code API
const vscode = acquireVsCodeApi();

// Initialize the UI when the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  // Get the app container
  const app = document.getElementById('app');
  if (!app) {
    console.error('App container not found');
    return;
  }

  // Create the UI
  app.innerHTML = `
    <h1>Memory Bank</h1>
    <div class="memory-bank-container">
      <div class="memory-form">
        <div class="form-group">
          <label for="key">Key:</label>
          <input type="text" id="key" placeholder="Enter key">
        </div>
        <div class="form-group">
          <label for="value">Value:</label>
          <textarea id="value" placeholder="Enter value"></textarea>
        </div>
        <div class="form-actions">
          <button id="remember-btn">Remember</button>
          <button id="recall-btn">Recall</button>
          <button id="clear-btn">Clear</button>
        </div>
      </div>
      <div class="memory-list">
        <h2>Stored Memories</h2>
        <div id="memories-container"></div>
      </div>
    </div>
  `;

  // Add event listeners
  const keyInput = document.getElementById('key') as HTMLInputElement;
  const valueInput = document.getElementById('value') as HTMLTextAreaElement;
  const rememberBtn = document.getElementById('remember-btn');
  const recallBtn = document.getElementById('recall-btn');
  const clearBtn = document.getElementById('clear-btn');
  const memoriesContainer = document.getElementById('memories-container');

  // Remember button
  rememberBtn?.addEventListener('click', () => {
    const key = keyInput.value.trim();
    const value = valueInput.value.trim();

    if (!key) {
      vscode.postMessage({ command: 'alert', text: 'Please enter a key' });
      return;
    }

    // Store in localStorage (which is now proxied to use MCP)
    localStorage.setItem(key, value);

    // Update the UI
    updateMemoriesList();

    // Clear the form
    keyInput.value = '';
    valueInput.value = '';

    // Show success message
    vscode.postMessage({ command: 'alert', text: `Remembered: ${key}` });
  });

  // Recall button
  recallBtn?.addEventListener('click', () => {
    const key = keyInput.value.trim();

    if (!key) {
      vscode.postMessage({ command: 'alert', text: 'Please enter a key to recall' });
      return;
    }

    // Get from localStorage (which is now proxied to use MCP)
    const value = localStorage.getItem(key);

    if (value === null) {
      vscode.postMessage({ command: 'alert', text: `No memory found for key: ${key}` });
      return;
    }

    // Update the value input
    valueInput.value = value;

    // Show success message
    vscode.postMessage({ command: 'log', text: `Recalled: ${key}=${value}` });
  });

  // Clear button
  clearBtn?.addEventListener('click', () => {
    // Clear the form
    keyInput.value = '';
    valueInput.value = '';
  });

  // Function to update the memories list
  function updateMemoriesList() {
    if (!memoriesContainer) return;

    // Clear the container
    memoriesContainer.innerHTML = '';

    // Get all keys from localStorage
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        keys.push(key);
      }
    }

    // Sort the keys
    keys.sort();

    // Create a list item for each key
    if (keys.length === 0) {
      memoriesContainer.innerHTML = '<p>No memories stored yet.</p>';
    } else {
      const ul = document.createElement('ul');
      ul.className = 'memories-list';

      keys.forEach(key => {
        const value = localStorage.getItem(key);
        const li = document.createElement('li');
        li.className = 'memory-item';
        
        const keySpan = document.createElement('span');
        keySpan.className = 'memory-key';
        keySpan.textContent = key;
        
        const valueSpan = document.createElement('span');
        valueSpan.className = 'memory-value';
        valueSpan.textContent = value || '';
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'memory-actions';
        
        const loadBtn = document.createElement('button');
        loadBtn.className = 'memory-load-btn';
        loadBtn.textContent = 'Load';
        loadBtn.addEventListener('click', () => {
          keyInput.value = key;
          valueInput.value = value || '';
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'memory-delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
          localStorage.removeItem(key);
          updateMemoriesList();
          vscode.postMessage({ command: 'alert', text: `Deleted: ${key}` });
        });
        
        actionsDiv.appendChild(loadBtn);
        actionsDiv.appendChild(deleteBtn);
        
        li.appendChild(keySpan);
        li.appendChild(valueSpan);
        li.appendChild(actionsDiv);
        
        ul.appendChild(li);
      });
      
      memoriesContainer.appendChild(ul);
    }
  }

  // Initial update of the memories list
  updateMemoriesList();

  // Listen for messages from the extension
  window.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.command) {
      case 'updateMemories':
        updateMemoriesList();
        break;
    }
  });

  // Log that the webview is ready
  vscode.postMessage({ command: 'log', text: 'Memory Bank webview is ready' });
});
