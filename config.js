/**
 * Copyright (c) 2025-2026 One Block Away LLC
 * All rights reserved. Proprietary and confidential.
 */

// Configuration loader for browser environment
// Configuration for Ollama MCP server connection

class Config {
  constructor() {
    this.config = {
      OLLAMA_HOST: 'http://localhost:11435'  // CORS proxy port
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

    // Method 2: Check if host is set in localStorage BUT only if it's the proxy port
    const storedHost = localStorage.getItem('OLLAMA_HOST');
    if (storedHost) {
      console.log('Found stored host:', storedHost);
      
      // Only use stored host if it's the CORS proxy port (11435) or a custom URL
      if (storedHost.includes(':11435') || (!storedHost.includes(':11434') && storedHost.startsWith('http'))) {
        console.log('Using valid stored host:', storedHost);
        this.config.OLLAMA_HOST = storedHost;
        return;
      } else {
        console.warn('Stored host is old direct Ollama URL, clearing and using proxy:', storedHost);
        localStorage.removeItem('OLLAMA_HOST');
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

    // Default to localhost:11435 (CORS proxy) - force this to be used
    console.log('Using default CORS proxy host:', this.config.OLLAMA_HOST);
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
  }

  hasOllamaConnection() {
    return !!(this.config.OLLAMA_HOST && this.config.OLLAMA_HOST.startsWith('http'));
  }

  clearHost() {
    this.config.OLLAMA_HOST = 'http://localhost:11435';  // CORS proxy port
    localStorage.removeItem('OLLAMA_HOST');
  }
}

// Make config available globally
window.Config = new Config();