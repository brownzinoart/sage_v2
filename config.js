/**
 * Copyright (c) 2025-2026 One Block Away LLC
 * All rights reserved. Proprietary and confidential.
 */

// Configuration loader for browser environment
// Since browsers can't access .env files directly, we'll provide multiple ways to set the API key

class Config {
  constructor() {
    this.config = {
      TOGETHER_API_KEY: null
    };
    this.loadConfig();
  }

  loadConfig() {
    // Method 1: Use the API key from your .env file directly
    const envApiKey = 'tgp_v1_WpkTEjIAfquehlTRCZohkRxJbI7kf-ku5XsBkw_G1BQ';
    if (envApiKey) {
      this.config.TOGETHER_API_KEY = envApiKey;
      // Save to localStorage for consistency
      localStorage.setItem('TOGETHER_API_KEY', envApiKey);
      return;
    }

    // Method 2: Check if key is set in localStorage (for persistence)
    const storedKey = localStorage.getItem('TOGETHER_API_KEY');
    if (storedKey) {
      this.config.TOGETHER_API_KEY = storedKey;
      return;
    }

    // Method 3: Check URL parameters (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const urlKey = urlParams.get('api_key');
    if (urlKey) {
      this.config.TOGETHER_API_KEY = urlKey;
      // Optionally save to localStorage
      localStorage.setItem('TOGETHER_API_KEY', urlKey);
      return;
    }

    // Method 4: Prompt user for API key if not found (fallback)
    this.promptForApiKey();
  }

  promptForApiKey() {
    const key = prompt(
      'Please enter your Together.ai API key:\n\n' +
      '1. Get your key from: https://api.together.xyz/settings/api-keys\n' +
      '2. Or set it in the .env file: TOGETHER_API_KEY=your_key\n' +
      '3. Or add ?api_key=your_key to the URL\n\n' +
      'API Key:'
    );
    
    if (key && key.trim()) {
      this.config.TOGETHER_API_KEY = key.trim();
      localStorage.setItem('TOGETHER_API_KEY', key.trim());
    } else {
      console.warn('No API key provided. AI features will not work.');
    }
  }

  get(key) {
    return this.config[key];
  }

  set(key, value) {
    this.config[key] = value;
    if (key === 'TOGETHER_API_KEY') {
      localStorage.setItem('TOGETHER_API_KEY', value);
    }
  }

  hasApiKey() {
    return !!(this.config.TOGETHER_API_KEY && this.config.TOGETHER_API_KEY.length > 10);
  }

  clearApiKey() {
    this.config.TOGETHER_API_KEY = null;
    localStorage.removeItem('TOGETHER_API_KEY');
  }
}

// Make config available globally
window.Config = new Config();