// Minimal MCP stdio server: handles { remember: key, value } and { recall: key }
import readline from 'node:readline';

interface Call {
  id: string;
  method: string;
  params: any;
}

interface Response {
  id: string;
  result: any;
  error?: any;
}

// In-memory storage for now - will be replaced with SQLite or JSON DB in future
const store = new Map<string, string>();

// Create readline interface to handle stdin/stdout communication
const rl = readline.createInterface({ 
  input: process.stdin, 
  output: process.stdout 
});

// Log server startup
console.error('MCP Memory Server started');

// Handle incoming lines from stdin
rl.on('line', (line) => {
  try {
    // Parse the incoming JSON message
    const call: Call = JSON.parse(line);
    
    // Log the received call (to stderr so it doesn't interfere with the protocol)
    console.error(`Received call: ${JSON.stringify(call)}`);
    
    // Process the call based on the method
    if (call.method === 'remember') {
      // Store the key-value pair
      const { key, value } = call.params;
      store.set(key, value);
      
      // Send success response
      const response: Response = { 
        id: call.id, 
        result: { success: true, message: `Remembered: ${key}=${value}` } 
      };
      console.log(JSON.stringify(response));
      
      // Log the operation (to stderr)
      console.error(`Stored: ${key}=${value}`);
    } 
    else if (call.method === 'recall') {
      // Retrieve the value for the given key
      const { key } = call.params;
      const value = store.get(key);
      
      // Send response with the value (or null if not found)
      const response: Response = { 
        id: call.id, 
        result: value !== undefined ? value : null 
      };
      console.log(JSON.stringify(response));
      
      // Log the operation (to stderr)
      console.error(`Retrieved: ${key}=${value}`);
    }
    else {
      // Handle unknown method
      const response: Response = { 
        id: call.id, 
        result: null,
        error: { message: `Unknown method: ${call.method}` } 
      };
      console.log(JSON.stringify(response));
      
      // Log the error (to stderr)
      console.error(`Error: Unknown method ${call.method}`);
    }
  } catch (error) {
    // Handle JSON parsing errors or other exceptions
    console.error(`Error processing message: ${error}`);
    
    // Try to send an error response if we can extract an ID
    try {
      const call = JSON.parse(line);
      if (call.id) {
        const response: Response = { 
          id: call.id, 
          result: null,
          error: { message: `Error processing request: ${error}` } 
        };
        console.log(JSON.stringify(response));
      }
    } catch {
      // If we can't even parse the JSON to get an ID, just log the error
      console.error('Could not send error response - invalid JSON');
    }
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.error('MCP Memory Server shutting down');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('MCP Memory Server shutting down');
  process.exit(0);
});

// Log that we're ready to receive commands
console.error('MCP Memory Server ready to receive commands');