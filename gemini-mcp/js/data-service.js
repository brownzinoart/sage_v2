/**
 * Copyright (c) 2025-2026 One Block Away LLC
 * All rights reserved. Proprietary and confidential.
 * 
 * Centralized Data Service - Handles all API interactions and data flow
 */

class SageDataService {
  constructor() {
    this.sageAPI = new SageAPI();
    this.cache = new Map();
    this.abortController = null;
    this.connectionState = {
      isConnected: false,
      lastChecked: null,
      currentHost: null
    };
  }

  // Main method to process user input and get complete response
  async processUserInput(userInput, experienceLevel, options = {}) {
    // Cancel any pending requests
    this.cancelPendingRequests();
    this.abortController = new AbortController();

    const { signal } = this.abortController;

    try {
      // Validate connection first
      await this.ensureConnection();

      // Handle demo mode
      if (userInput.toLowerCase() === 'demo') {
        return this.getDemoResponse(experienceLevel);
      }

      // Create request context
      const requestContext = {
        userInput: userInput.trim(),
        experienceLevel,
        timestamp: Date.now(),
        requestId: this.generateRequestId()
      };

      // Execute parallel API calls with proper error handling
      const responseData = await this.executeParallelRequests(requestContext, signal);
      
      // Store in session with metadata
      this.storeResponse(responseData);
      
      return {
        success: true,
        data: responseData
      };

    } catch (error) {
      // Handle different error types appropriately
      return this.handleError(error, userInput, experienceLevel);
    }
  }

  // Execute API calls in parallel with proper error handling
  async executeParallelRequests(context, signal) {
    const { userInput, experienceLevel, timestamp, requestId } = context;

    // Create promises with individual error handling
    const promises = [
      this.safeAPICall(() => this.sageAPI.generateResponse(userInput, experienceLevel), 'aiResponse', signal),
      this.safeAPICall(() => this.sageAPI.getBenefitsForExperience(experienceLevel), 'benefits', signal),
      this.safeAPICall(() => this.sageAPI.getProductRecommendations(userInput, experienceLevel), 'products', signal)
    ];

    // Wait for all requests to complete
    const results = await Promise.allSettled(promises);
    
    // Process results and handle partial failures
    const responseData = {
      userInput,
      experienceLevel,
      timestamp,
      requestId,
      host: this.connectionState.currentHost,
      isDemo: false
    };

    // Extract successful results
    results.forEach((result, index) => {
      const keys = ['aiResponse', 'benefits', 'products'];
      const key = keys[index];
      
      if (result.status === 'fulfilled') {
        responseData[key] = result.value;
      } else {
        console.warn(`${key} request failed:`, result.reason);
        responseData[key] = this.getFallbackData(key, experienceLevel);
        responseData.hasPartialFailure = true;
      }
    });

    return responseData;
  }

  // Safe API call wrapper with timeout and error handling
  async safeAPICall(apiCall, context, signal) {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${context} request timeout`)), 30000);
    });

    return Promise.race([apiCall(), timeout]);
  }

  // Connection management with auto-recovery
  async ensureConnection() {
    const now = Date.now();
    
    // Check if we need to validate connection
    if (!this.connectionState.isConnected || 
        !this.connectionState.lastChecked || 
        now - this.connectionState.lastChecked > 60000) { // 1 minute
      
      await this.validateConnection();
    }

    if (!this.connectionState.isConnected) {
      throw new ConnectionError('No valid connection available');
    }
  }

  // Validate and recover connection
  async validateConnection() {
    try {
      const result = await window.Config.testConnection();
      
      if (result.success) {
        this.connectionState.isConnected = true;
        this.connectionState.currentHost = result.host;
        this.connectionState.lastChecked = Date.now();
        return;
      }

      // Try auto-discovery
      const discovery = await window.Config.autoDiscoverHost();
      if (discovery.success) {
        this.connectionState.isConnected = true;
        this.connectionState.currentHost = discovery.host;
        this.connectionState.lastChecked = Date.now();
        return;
      }

      // Connection failed
      this.connectionState.isConnected = false;
      throw new ConnectionError('Unable to establish connection to Ollama server');

    } catch (error) {
      this.connectionState.isConnected = false;
      throw error;
    }
  }

  // Get cached response if available and valid
  getCachedResponse() {
    try {
      const stored = sessionStorage.getItem('sageResponse');
      if (!stored) return null;

      const data = JSON.parse(stored);
      
      // Validate data freshness (30 minutes)
      const age = Date.now() - data.timestamp;
      if (age > 30 * 60 * 1000) {
        this.clearCache();
        return null;
      }

      // Validate host consistency
      if (data.host && data.host !== this.connectionState.currentHost) {
        this.clearCache();
        return null;
      }

      // Check for fallback data patterns
      if (this.isFallbackData(data)) {
        this.clearCache();
        return null;
      }

      return data;

    } catch (error) {
      console.warn('Cache validation failed:', error);
      this.clearCache();
      return null;
    }
  }

  // Store response in session storage with metadata
  storeResponse(responseData) {
    try {
      sessionStorage.setItem('sageResponse', JSON.stringify(responseData));
    } catch (error) {
      console.error('Failed to store response:', error);
      // Continue without caching
    }
  }

  // Clear all cached data
  clearCache() {
    sessionStorage.removeItem('sageResponse');
    this.cache.clear();
  }

  // Cancel pending requests
  cancelPendingRequests() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // Generate demo response
  getDemoResponse(experienceLevel) {
    const demoData = this.sageAPI.getDemoData(experienceLevel);
    return {
      success: true,
      data: {
        userInput: 'demo',
        experienceLevel,
        ...demoData,
        host: this.connectionState.currentHost,
        timestamp: Date.now(),
        isDemo: true,
        requestId: this.generateRequestId()
      }
    };
  }

  // Enhanced error handling with user-friendly messages
  handleError(error, userInput, experienceLevel) {
    console.error('Data service error:', error);

    // Connection errors
    if (error instanceof ConnectionError || error.message.includes('connection')) {
      return {
        success: false,
        error: 'connection',
        message: 'Unable to connect to AI service. Please check your connection.',
        fallbackAvailable: true,
        userInput,
        experienceLevel
      };
    }

    // Timeout errors
    if (error.message.includes('timeout')) {
      return {
        success: false,
        error: 'timeout',
        message: 'Request took too long. Please try again.',
        fallbackAvailable: true,
        userInput,
        experienceLevel
      };
    }

    // Generic error
    return {
      success: false,
      error: 'generic',
      message: 'Something went wrong. Please try again.',
      fallbackAvailable: false,
      userInput,
      experienceLevel
    };
  }

  // Utility methods
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isFallbackData(data) {
    if (!data.aiResponse) return false;
    
    const fallbackPatterns = [
      'Your question requires personalized cannabis guidance',
      'Your cannabis query needs our full recommendation engine',
      'Your advanced cannabis query requires our comprehensive analysis system'
    ];

    return fallbackPatterns.some(pattern => 
      data.aiResponse.includes(pattern) && 
      data.aiResponse.length < 500 &&
      !data.aiResponse.includes('[INTRODUCTION]')
    );
  }

  getFallbackData(dataType, experienceLevel) {
    const fallbacks = {
      aiResponse: 'We\'re experiencing high demand. Your request is being processed with our backup systems.',
      benefits: this.sageAPI.getBenefitsForExperience(experienceLevel),
      products: []
    };
    
    return fallbacks[dataType] || null;
  }

  // Connection state getters
  isConnected() {
    return this.connectionState.isConnected;
  }

  getCurrentHost() {
    return this.connectionState.currentHost;
  }
}

// Custom error types
class ConnectionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConnectionError';
  }
}

// Export for use in other modules
window.SageDataService = SageDataService;