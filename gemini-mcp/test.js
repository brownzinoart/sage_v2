// Quick test to verify the server works
import { spawn } from 'child_process';

console.log('Testing Gemini MCP Server...\n');

// Set API key for test
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your-api-key-here';

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-api-key-here') {
  console.error('⚠️  Please set GEMINI_API_KEY environment variable');
  console.error('Run: export GEMINI_API_KEY="your-actual-key"');
  process.exit(1);
}

const server = spawn('node', ['dist/index.js'], {
  env: process.env,
  stdio: ['pipe', 'pipe', 'pipe']
});

// Send a list tools request
const listToolsRequest = {
  jsonrpc: '2.0',
  method: 'tools/list',
  id: 1
};

server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

// Handle responses
server.stdout.on('data', (data) => {
  try {
    const lines = data.toString().split('\n').filter(line => line.trim());
    for (const line of lines) {
      const response = JSON.parse(line);
      if (response.result?.tools) {
        console.log('✅ Server is working! Available tools:');
        response.result.tools.forEach(tool => {
          console.log(`  - ${tool.name}: ${tool.description}`);
        });
        process.exit(0);
      }
    }
  } catch (e) {
    // Ignore parse errors from startup messages
  }
});

server.stderr.on('data', (data) => {
  const message = data.toString();
  if (!message.includes('running on stdio')) {
    console.error('Server error:', message);
  }
});

// Timeout after 5 seconds
setTimeout(() => {
  console.error('❌ Test timeout - server did not respond');
  server.kill();
  process.exit(1);
}, 5000);