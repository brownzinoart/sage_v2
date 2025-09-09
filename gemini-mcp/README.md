# Gemini MCP Server

A Model Context Protocol (MCP) server that integrates Google's Gemini AI into Claude Desktop, providing powerful AI capabilities through simple tool calls.

## Features

- **Chat**: General conversations with Gemini Pro
- **Analyze**: Text analysis (sentiment, summary, keywords, entities, questions)
- **Code**: Generate, fix, explain, review, or refactor code
- **Translate**: Language translation with auto-detection

## Installation

### 1. Install Dependencies

```bash
cd ~/gemini-mcp
npm install
npm run build
```

### 2. Configure Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gemini": {
      "command": "node",
      "args": ["/Users/wallymo/gemini-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY"
      }
    }
  }
}
```

### 3. Get Your Gemini API Key

Since you already have a Gemini API key from your Sage project:

1. Check your `.env` files in the sage/frontend directory
2. Or get a new one from: https://makersuite.google.com/app/apikey

### 4. Restart Claude Desktop

After configuration, restart Claude Desktop to load the MCP server.

## Usage Examples

Once installed, you can use these commands in Claude:

### Chat with Gemini
```
Use gemini_chat to explain quantum computing in simple terms
```

### Analyze Text
```
Use gemini_analyze to get the sentiment of this customer review: "The product exceeded my expectations!"
```

### Generate Code
```
Use gemini_code to generate a Python function that sorts a list of dictionaries by a specific key
```

### Translate
```
Use gemini_translate to translate "Hello, how are you?" to Spanish
```

## Available Tools

### gemini_chat
General purpose chat with Gemini.

**Parameters:**
- `prompt` (required): Your question or prompt
- `model`: `gemini-pro` or `gemini-pro-vision` (default: gemini-pro)
- `temperature`: 0-2 for randomness (default: 0.7)
- `maxTokens`: 1-32768 max response length (default: 2048)
- `systemPrompt`: Optional context setting

### gemini_analyze
Analyze text for various insights.

**Parameters:**
- `text` (required): Text to analyze
- `analysisType` (required): One of:
  - `sentiment`: Emotional tone analysis
  - `summary`: Concise summarization
  - `keywords`: Key term extraction
  - `entities`: Named entity recognition
  - `questions`: Generate questions about the text
- `model`: Model choice (default: gemini-pro)

### gemini_code
Code generation and manipulation.

**Parameters:**
- `prompt` (required): Code task description
- `language` (required): Programming language
- `type`: Operation type:
  - `generate`: Create new code
  - `fix`: Debug existing code
  - `explain`: Explain code logic
  - `review`: Code review
  - `refactor`: Improve code structure
- `context`: Additional code context

### gemini_translate
Language translation.

**Parameters:**
- `text` (required): Text to translate
- `targetLanguage` (required): Target language
- `sourceLanguage`: Source language (default: auto-detect)

## Development

### Build from Source
```bash
npm run build
```

### Run in Development Mode
```bash
npm run dev
```

### Test the Server
```bash
# Set your API key
export GEMINI_API_KEY="your-key-here"

# Run the server
npm start
```

## Troubleshooting

### API Key Not Working
1. Verify key is set in Claude config
2. Check key validity at Google AI Studio
3. Ensure no extra spaces in the key

### Server Not Loading
1. Check Claude Desktop logs
2. Verify path in config is absolute
3. Ensure `dist/index.js` exists after build

### No Response from Tools
1. Restart Claude Desktop
2. Check server is in MCP tools list
3. Verify Gemini API quota

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (required)

## License

MIT

## Author

Created by wallymo for enhanced AI capabilities in Claude Desktop.