#!/bin/bash

echo "🚀 Gemini MCP Setup Script"
echo "========================="
echo ""

# Check if API key is provided
if [ -z "$1" ]; then
    echo "Please provide your Gemini API key as an argument:"
    echo "  ./setup.sh YOUR_API_KEY"
    echo ""
    echo "Get your API key from: https://makersuite.google.com/app/apikey"
    exit 1
fi

API_KEY=$1
CONFIG_DIR="$HOME/Library/Application Support/Claude"
CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"

# Create config directory if it doesn't exist
mkdir -p "$CONFIG_DIR"

# Create or update the config file
cat > "$CONFIG_FILE" << EOF
{
  "mcpServers": {
    "gemini": {
      "command": "node",
      "args": ["$HOME/gemini-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "$API_KEY"
      }
    }
  }
}
EOF

echo "✅ Configuration saved to: $CONFIG_FILE"
echo ""
echo "Testing the server..."

# Test the server
export GEMINI_API_KEY="$API_KEY"
node test.js

echo ""
echo "📝 Next steps:"
echo "1. Restart Claude Desktop"
echo "2. Look for 'gemini' in the MCP tools"
echo "3. Try: 'Use gemini_chat to tell me a joke'"
echo ""
echo "✨ Setup complete!"