/**
 * Copyright (c) 2025-2026 One Block Away LLC
 * All rights reserved. Proprietary and confidential.
 * 
 * Legacy Adapter - Bridges old code with new modular architecture
 * This ensures backward compatibility while we transition
 */

// Legacy compatibility shims
if (typeof window !== 'undefined') {
  // Preserve existing SageFormHandler for any direct references
  window.LegacySageFormHandler = window.SageFormHandler || class {};
  
  // Override the old SageFormHandler to use new UI Controller
  window.SageFormHandler = class SageFormHandlerShim {
    constructor() {
      // If new UI Controller is available, delegate to it
      if (window.SageUIController) {
        console.warn('SageFormHandler is deprecated. Consider using SageUIController directly.');
        this.modernController = new SageUIController();
      } else {
        // Fallback to legacy behavior
        this.legacyInit();
      }
    }

    legacyInit() {
      console.warn('Using legacy fallback for SageFormHandler');
      // Minimal legacy implementation
      this.sageAPI = new SageAPI();
      this.experienceSelector = null;
    }

    // Delegate methods to modern controller if available
    setExperienceSelector(selector) {
      if (this.modernController) {
        this.modernController.experienceSelector = selector;
      } else {
        this.experienceSelector = selector;
      }
    }

    async handleSubmit(e) {
      if (this.modernController) {
        return this.modernController.handleFormSubmit(e);
      }
      
      // Legacy fallback
      console.warn('Using legacy handleSubmit fallback');
      e.preventDefault();
      // Minimal implementation to prevent breaking
    }
  };

  // Preserve existing ProductsPageHandler for compatibility
  window.LegacyProductsPageHandler = window.ProductsPageHandler || class {};
  
  // Override ProductsPageHandler to use new Results Controller
  window.ProductsPageHandler = class ProductsPageHandlerShim {
    constructor() {
      if (window.SageResultsController) {
        console.warn('ProductsPageHandler is deprecated. Consider using SageResultsController directly.');
        // Don't create a new instance, let the results controller handle DOMContentLoaded
      } else {
        this.legacyInit();
      }
    }

    legacyInit() {
      console.warn('Using legacy fallback for ProductsPageHandler');
      // Minimal legacy implementation
      this.responseData = null;
      this.init();
    }

    init() {
      // Legacy initialization
      this.loadResponseData();
    }

    loadResponseData() {
      try {
        const storedData = sessionStorage.getItem('sageResponse');
        if (storedData) {
          this.responseData = JSON.parse(storedData);
        }
      } catch (error) {
        console.error('Legacy data loading failed:', error);
      }
    }
  };

  // Provide migration helpers
  window.SageMigrationHelper = {
    // Check if new architecture is loaded
    isModernArchitecture() {
      return !!(window.SageDataService && window.SageUIController && window.SageResultsController);
    },

    // Get active controller instance
    getActiveController() {
      if (window.location.pathname.includes('products.html')) {
        return window.sageResultsController;
      } else {
        return window.sageUIController;
      }
    },

    // Migration status
    getMigrationStatus() {
      return {
        modernArchitecture: this.isModernArchitecture(),
        legacyFallbacks: !this.isModernArchitecture(),
        recommendedAction: this.isModernArchitecture() 
          ? 'Update code to use new controllers directly'
          : 'Load new modular scripts'
      };
    }
  };

  // Console info for developers
  if (typeof console !== 'undefined') {
    console.groupCollapsed('🏗️ Sage Architecture Migration Info');
    console.log('Migration Status:', window.SageMigrationHelper.getMigrationStatus());
    console.log('New Controllers Available:', {
      SageDataService: !!window.SageDataService,
      SageUIController: !!window.SageUIController,
      SageResultsController: !!window.SageResultsController
    });
    console.log('Legacy Shims Active:', {
      SageFormHandler: window.SageFormHandler.name === 'SageFormHandlerShim',
      ProductsPageHandler: window.ProductsPageHandler.name === 'ProductsPageHandlerShim'
    });
    console.groupEnd();
  }
}