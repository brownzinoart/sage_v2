/**
 * Copyright (c) 2025-2026 One Block Away LLC
 * All rights reserved. Proprietary and confidential.
 */

// Configuration loader for browser environment
// Configuration for Ollama MCP server connection

class Config {
  constructor() {
    this.config = {
      OLLAMA_HOST: 'http://localhost:3000/ollama',  // CORS proxy port
      // Dispensary/inventory source configuration
      DISPENSARY_SOURCE: 'static',            // 'static' | 'apotheca' | 'none'
      // Default static inventory path (served alongside the app)
      INVENTORY_SOURCE_URL: './inventory/apotheca-thca.json',
      // Optional proxy for live inventory fetches (if/when enabled)
      INVENTORY_PROXY: ''
    };
    this.loadConfig();
  }

  loadConfig() {
    console.log('=== LOADING CONFIG ===');
    
    // Method 1: Check URL parameters first (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const urlHost = urlParams.get('host');
    if (urlHost) {
      console.log('Using URL parameter host:', urlHost);
      this.config.OLLAMA_HOST = urlHost;
      localStorage.setItem('OLLAMA_HOST', urlHost);
      return;
    }

    // Method 2: Check if host is set in localStorage (accept any http URL, including direct 11434)
    const storedHost = localStorage.getItem('OLLAMA_HOST');
    if (storedHost) {
      console.log('Found stored host:', storedHost);
      if (storedHost.startsWith('http')) {
        console.log('Using stored host:', storedHost);
        this.config.OLLAMA_HOST = storedHost;
        return;
      }
    }

    // Method 3: Use environment variable (usually not available in browser)
    try {
      const envHost = typeof process !== 'undefined' && process.env ? process.env.OLLAMA_HOST : null;
      if (envHost) {
        console.log('Using environment host:', envHost);
        this.config.OLLAMA_HOST = envHost;
        localStorage.setItem('OLLAMA_HOST', envHost);
        return;
      }
    } catch (e) {
      // Skip environment variable check in browser
    }

    // Smart default selection based on environment
    try {
      const port = window.location && window.location.port;
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      
      console.log(`Environment: ${protocol}//${hostname}:${port}`);
      
      // If served from dev server on port 3000, use same-origin proxy
      if (port === '3000') {
        this.config.OLLAMA_HOST = `${window.location.origin}/ollama`;
        console.log('Using same-origin proxy host:', this.config.OLLAMA_HOST);
      } 
      // If served from port 8080 or other common dev ports, try direct connection first
      else if (port === '8080' || port === '5173' || port === '4173') {
        // Try direct Ollama connection for these dev environments
        this.config.OLLAMA_HOST = 'http://localhost:11434';
        console.log('Using direct Ollama host for dev environment:', this.config.OLLAMA_HOST);
      }
      // If served from localhost without specific port, try CORS proxy
      else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        this.config.OLLAMA_HOST = 'http://localhost:11435';  // CORS proxy
        console.log('Using CORS proxy host for local development:', this.config.OLLAMA_HOST);
      }
      // For other environments, stick with default CORS proxy
      else {
        console.log('Using default CORS proxy host:', this.config.OLLAMA_HOST);
      }
    } catch (error) {
      console.warn('Environment detection failed, using default:', error);
      // Keep existing default
    }
    localStorage.setItem('OLLAMA_HOST', this.config.OLLAMA_HOST);
  }

  promptForHost() {
    const host = prompt(
      'Please enter your Ollama server URL:\n\n' +
      '1. Default: http://localhost:11434\n' +
      '2. Or set it in the .env file: OLLAMA_HOST=your_host\n' +
      '3. Or add ?host=your_host to the URL\n\n' +
      'Ollama Host:'
    );
    
    if (host && host.trim()) {
      this.config.OLLAMA_HOST = host.trim();
      localStorage.setItem('OLLAMA_HOST', host.trim());
    } else {
      console.warn('Using default Ollama host:', this.config.OLLAMA_HOST);
    }
  }

  get(key) {
    return this.config[key];
  }

  set(key, value) {
    this.config[key] = value;
    if (key === 'OLLAMA_HOST') {
      localStorage.setItem('OLLAMA_HOST', value);
    }
    // Allow overriding inventory settings via localStorage for quick tests
    if (key === 'DISPENSARY_SOURCE') {
      localStorage.setItem('DISPENSARY_SOURCE', value);
    }
    if (key === 'INVENTORY_SOURCE_URL') {
      localStorage.setItem('INVENTORY_SOURCE_URL', value);
    }
    if (key === 'INVENTORY_PROXY') {
      localStorage.setItem('INVENTORY_PROXY', value);
    }
  }

  hasOllamaConnection() {
    return !!(this.config.OLLAMA_HOST && this.config.OLLAMA_HOST.startsWith('http'));
  }

  clearHost() {
    this.config.OLLAMA_HOST = 'http://localhost:11435';  // CORS proxy port
    localStorage.removeItem('OLLAMA_HOST');
  }

  // Test connection to current Ollama host
  async testConnection() {
    const host = this.config.OLLAMA_HOST;
    console.log(`Testing connection to: ${host}`);
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${host}/api/tags`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      
      if (response.ok) {
        console.log('✅ Connection successful');
        return { success: true, host: host };
      } else {
        console.log(`❌ Connection failed with status: ${response.status}`);
        return { success: false, host: host, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      return { success: false, host: host, error: error.message };
    }
  }

  // Auto-discover working Ollama connection
  async autoDiscoverHost() {
    const candidates = [
      'http://localhost:11434',      // Direct Ollama
      'http://localhost:11435',      // CORS proxy
      `${window.location.origin}/ollama`, // Same-origin proxy
      'http://127.0.0.1:11434',     // Alternative localhost
    ];

    console.log('Auto-discovering working Ollama host...');
    
    for (const candidate of candidates) {
      console.log(`Trying: ${candidate}`);
      this.config.OLLAMA_HOST = candidate;
      const result = await this.testConnection();
      
      if (result.success) {
        console.log(`✅ Found working host: ${candidate}`);
        localStorage.setItem('OLLAMA_HOST', candidate);
        return { success: true, host: candidate };
      }
    }
    
    console.log('❌ No working Ollama host found');
    // Reset to default
    this.config.OLLAMA_HOST = 'http://localhost:11435';
    return { success: false, error: 'No working host found' };
  }
}

// Make config available globally
window.Config = new Config();
