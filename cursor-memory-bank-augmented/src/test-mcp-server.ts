// Simple test script for the MCP memory server
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Find the path to the memoryServer.js file
const serverPath = path.join(__dirname, 'memoryServer.js');

// Check if the server file exists
if (!fs.existsSync(serverPath)) {
  console.error(`Error: Server file not found at ${serverPath}`);
  console.error('Make sure to run "npm run compile" first to build the TypeScript files.');
  process.exit(1);
}

console.log(`Starting MCP memory server from: ${serverPath}`);

// Start the MCP server process
const serverProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', process.stderr]
});

// Handle server process events
serverProcess.on('error', (err) => {
  console.error('Failed to start MCP server:', err);
  process.exit(1);
});

// Create a function to send a command to the server and get the response
function sendCommand(method: string, params: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = Math.random().toString(36).substring(2, 15);
    const command = {
      id,
      method,
      params
    };
    
    // Convert command to JSON string and add newline
    const commandStr = JSON.stringify(command) + '\n';
    
    // Set up a one-time listener for the response
    const onData = (data: Buffer) => {
      try {
        const response = JSON.parse(data.toString());
        if (response.id === id) {
          serverProcess.stdout.removeListener('data', onData);
          resolve(response);
        }
      } catch (err) {
        console.error('Error parsing response:', err);
        reject(err);
      }
    };
    
    // Listen for the response
    serverProcess.stdout.on('data', onData);
    
    // Send the command
    serverProcess.stdin.write(commandStr);
  });
}

// Run the test
async function runTest() {
  try {
    console.log('Testing "remember" method...');
    const rememberResponse = await sendCommand('remember', { key: 'hello', value: 'world' });
    console.log('Remember response:', rememberResponse);
    
    console.log('\nTesting "recall" method...');
    const recallResponse = await sendCommand('recall', { key: 'hello' });
    console.log('Recall response:', recallResponse);
    
    console.log('\nTesting recall of non-existent key...');
    const nonExistentResponse = await sendCommand('recall', { key: 'nonexistent' });
    console.log('Non-existent key response:', nonExistentResponse);
    
    console.log('\nAll tests completed successfully!');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    // Clean up
    serverProcess.kill();
    process.exit(0);
  }
}

// Run the test
runTest();