#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
// Schema definitions for our tools
const GeminiChatSchema = z.object({
    prompt: z.string().describe('The prompt to send to Gemini'),
    model: z.enum(['gemini-pro', 'gemini-pro-vision']).default('gemini-pro').describe('The Gemini model to use'),
    temperature: z.number().min(0).max(2).default(0.7).describe('Temperature for response generation'),
    maxTokens: z.number().min(1).max(32768).default(2048).describe('Maximum tokens in response'),
    systemPrompt: z.string().optional().describe('Optional system prompt to set context')
});
const GeminiAnalyzeSchema = z.object({
    text: z.string().describe('The text to analyze'),
    analysisType: z.enum(['sentiment', 'summary', 'keywords', 'entities', 'questions']).describe('Type of analysis to perform'),
    model: z.enum(['gemini-pro', 'gemini-pro-vision']).default('gemini-pro')
});
const GeminiCodeSchema = z.object({
    prompt: z.string().describe('Description of the code to generate or fix'),
    language: z.string().describe('Programming language (e.g., python, javascript, typescript)'),
    context: z.string().optional().describe('Additional context or existing code'),
    type: z.enum(['generate', 'fix', 'explain', 'review', 'refactor']).default('generate')
});
const GeminiTranslateSchema = z.object({
    text: z.string().describe('Text to translate'),
    targetLanguage: z.string().describe('Target language (e.g., Spanish, French, Japanese)'),
    sourceLanguage: z.string().default('auto').describe('Source language (auto-detect by default)')
});
// Server implementation
class GeminiMCPServer {
    server;
    genAI = null;
    constructor() {
        this.server = new Server({
            name: 'gemini-mcp',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupHandlers();
        this.initializeGemini();
    }
    initializeGemini() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('Warning: GEMINI_API_KEY not set. Set it as an environment variable.');
            console.error('Export GEMINI_API_KEY="your-api-key" or add it to your MCP settings.');
            return;
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }
    setupHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'gemini_chat',
                    description: 'Chat with Google Gemini AI for general conversations and questions',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            prompt: { type: 'string', description: 'The prompt to send to Gemini' },
                            model: {
                                type: 'string',
                                enum: ['gemini-pro', 'gemini-pro-vision'],
                                default: 'gemini-pro',
                                description: 'The Gemini model to use'
                            },
                            temperature: {
                                type: 'number',
                                minimum: 0,
                                maximum: 2,
                                default: 0.7,
                                description: 'Temperature for response generation'
                            },
                            maxTokens: {
                                type: 'number',
                                minimum: 1,
                                maximum: 32768,
                                default: 2048,
                                description: 'Maximum tokens in response'
                            },
                            systemPrompt: {
                                type: 'string',
                                description: 'Optional system prompt to set context'
                            }
                        },
                        required: ['prompt']
                    }
                },
                {
                    name: 'gemini_analyze',
                    description: 'Analyze text using Gemini for sentiment, summary, keywords, entities, or questions',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            text: { type: 'string', description: 'The text to analyze' },
                            analysisType: {
                                type: 'string',
                                enum: ['sentiment', 'summary', 'keywords', 'entities', 'questions'],
                                description: 'Type of analysis to perform'
                            },
                            model: {
                                type: 'string',
                                enum: ['gemini-pro', 'gemini-pro-vision'],
                                default: 'gemini-pro'
                            }
                        },
                        required: ['text', 'analysisType']
                    }
                },
                {
                    name: 'gemini_code',
                    description: 'Generate, fix, explain, review, or refactor code using Gemini',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            prompt: { type: 'string', description: 'Description of the code task' },
                            language: { type: 'string', description: 'Programming language' },
                            context: { type: 'string', description: 'Additional context or existing code' },
                            type: {
                                type: 'string',
                                enum: ['generate', 'fix', 'explain', 'review', 'refactor'],
                                default: 'generate',
                                description: 'Type of code operation'
                            }
                        },
                        required: ['prompt', 'language']
                    }
                },
                {
                    name: 'gemini_translate',
                    description: 'Translate text between languages using Gemini',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            text: { type: 'string', description: 'Text to translate' },
                            targetLanguage: { type: 'string', description: 'Target language' },
                            sourceLanguage: {
                                type: 'string',
                                default: 'auto',
                                description: 'Source language (auto-detect by default)'
                            }
                        },
                        required: ['text', 'targetLanguage']
                    }
                }
            ]
        }));
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            if (!this.genAI) {
                throw new McpError(ErrorCode.InternalError, 'Gemini API not initialized. Please set GEMINI_API_KEY environment variable.');
            }
            switch (request.params.name) {
                case 'gemini_chat':
                    return await this.handleChat(request.params.arguments);
                case 'gemini_analyze':
                    return await this.handleAnalyze(request.params.arguments);
                case 'gemini_code':
                    return await this.handleCode(request.params.arguments);
                case 'gemini_translate':
                    return await this.handleTranslate(request.params.arguments);
                default:
                    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
        });
    }
    async handleChat(args) {
        const params = GeminiChatSchema.parse(args);
        try {
            const model = this.genAI.getGenerativeModel({
                model: params.model,
                generationConfig: {
                    temperature: params.temperature,
                    maxOutputTokens: params.maxTokens,
                }
            });
            const fullPrompt = params.systemPrompt
                ? `${params.systemPrompt}\n\nUser: ${params.prompt}`
                : params.prompt;
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const text = response.text();
            return {
                content: [
                    {
                        type: 'text',
                        text: text
                    }
                ]
            };
        }
        catch (error) {
            throw new McpError(ErrorCode.InternalError, `Gemini API error: ${error.message}`);
        }
    }
    async handleAnalyze(args) {
        const params = GeminiAnalyzeSchema.parse(args);
        const prompts = {
            sentiment: `Analyze the sentiment of the following text. Provide a detailed analysis including overall sentiment (positive/negative/neutral), confidence score, and key emotional indicators:\n\n${params.text}`,
            summary: `Provide a concise summary of the following text, capturing the main points and key ideas:\n\n${params.text}`,
            keywords: `Extract the most important keywords and phrases from the following text. List them in order of relevance:\n\n${params.text}`,
            entities: `Identify and categorize all named entities (people, organizations, locations, dates, etc.) in the following text:\n\n${params.text}`,
            questions: `Generate insightful questions based on the following text that would help deepen understanding of the topic:\n\n${params.text}`
        };
        try {
            const model = this.genAI.getGenerativeModel({ model: params.model });
            const result = await model.generateContent(prompts[params.analysisType]);
            const response = await result.response;
            return {
                content: [
                    {
                        type: 'text',
                        text: `## ${params.analysisType.charAt(0).toUpperCase() + params.analysisType.slice(1)} Analysis\n\n${response.text()}`
                    }
                ]
            };
        }
        catch (error) {
            throw new McpError(ErrorCode.InternalError, `Analysis error: ${error.message}`);
        }
    }
    async handleCode(args) {
        const params = GeminiCodeSchema.parse(args);
        const prompts = {
            generate: `Generate ${params.language} code for the following requirement:\n${params.prompt}${params.context ? '\n\nContext:\n' + params.context : ''}`,
            fix: `Fix the following ${params.language} code issue:\n${params.prompt}${params.context ? '\n\nCode:\n' + params.context : ''}`,
            explain: `Explain the following ${params.language} code in detail:\n${params.prompt}${params.context ? '\n\nCode:\n' + params.context : ''}`,
            review: `Review the following ${params.language} code for best practices, potential issues, and improvements:\n${params.prompt}${params.context ? '\n\nCode:\n' + params.context : ''}`,
            refactor: `Refactor the following ${params.language} code to improve readability, performance, and maintainability:\n${params.prompt}${params.context ? '\n\nCode:\n' + params.context : ''}`
        };
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(prompts[params.type]);
            const response = await result.response;
            return {
                content: [
                    {
                        type: 'text',
                        text: response.text()
                    }
                ]
            };
        }
        catch (error) {
            throw new McpError(ErrorCode.InternalError, `Code operation error: ${error.message}`);
        }
    }
    async handleTranslate(args) {
        const params = GeminiTranslateSchema.parse(args);
        const prompt = params.sourceLanguage === 'auto'
            ? `Translate the following text to ${params.targetLanguage}:\n\n${params.text}`
            : `Translate the following text from ${params.sourceLanguage} to ${params.targetLanguage}:\n\n${params.text}`;
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return {
                content: [
                    {
                        type: 'text',
                        text: response.text()
                    }
                ]
            };
        }
        catch (error) {
            throw new McpError(ErrorCode.InternalError, `Translation error: ${error.message}`);
        }
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Gemini MCP server running on stdio');
    }
}
// Main execution
const server = new GeminiMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map