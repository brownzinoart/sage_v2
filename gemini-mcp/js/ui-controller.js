/**
 * Copyright (c) 2025-2026 One Block Away LLC
 * All rights reserved. Proprietary and confidential.
 * 
 * UI Controller - Manages all user interface interactions and state
 */

class SageUIController {
  constructor() {
    this.dataService = new SageDataService();
    this.loadingState = {
      isLoading: false,
      startTime: null,
      progressTimer: null,
      stageTimers: []
    };
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initializeComponents();
  }

  setupEventListeners() {
    const askButton = document.querySelector('.ask-btn');
    const promptInput = document.querySelector('.prompt-input');

    if (askButton && promptInput) {
      askButton.addEventListener('click', (e) => this.handleFormSubmit(e));
      
      promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleFormSubmit(e);
        }
      });

      // Add input validation
      promptInput.addEventListener('input', () => this.validateInput());
    }
  }

  initializeComponents() {
    // Initialize placeholder rotator
    const promptInput = document.querySelector('.prompt-input');
    if (promptInput) {
      new PlaceholderRotator(promptInput);
    }

    // Initialize experience selector
    this.experienceSelector = new ExperienceSelector();
    
    // Add connection status indicator
    this.addConnectionIndicator();

    // Background warmup
    this.dataService.ensureConnection().catch(() => {
      // Silent: warmup is best effort
    });
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    
    const promptInput = document.querySelector('.prompt-input');
    const askButton = document.querySelector('.ask-btn');
    const userInput = promptInput.value.trim();
    
    // Validation
    if (!this.validateSubmission(userInput, promptInput)) return;

    const experienceLevel = this.experienceSelector?.getSelectedLevel() || 'casual';
    
    // Start loading state
    this.setLoadingState(true);
    
    try {
      // Process the request
      const result = await this.dataService.processUserInput(userInput, experienceLevel);
      
      if (result.success) {
        // Success - navigate to results
        this.navigateToResults();
      } else {
        // Handle error with appropriate UI feedback
        this.handleError(result);
      }
      
    } catch (error) {
      console.error('Unexpected error:', error);
      this.handleError({
        error: 'unexpected',
        message: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      this.setLoadingState(false);
    }
  }

  validateSubmission(userInput, promptInput) {
    if (!userInput) {
      this.showValidationError(promptInput, 'Please enter your question');
      return false;
    }

    if (userInput.length > 500) {
      this.showValidationError(promptInput, 'Please keep your question under 500 characters');
      return false;
    }

    return true;
  }

  validateInput() {
    const promptInput = document.querySelector('.prompt-input');
    const askButton = document.querySelector('.ask-btn');
    
    if (promptInput && askButton) {
      const isValid = promptInput.value.trim().length > 0;
      askButton.disabled = !isValid || this.loadingState.isLoading;
    }
  }

  showValidationError(input, message) {
    // Remove existing error
    const existingError = input.parentNode.querySelector('.validation-error');
    if (existingError) existingError.remove();

    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      color: #ff4757;
      font-size: 0.875rem;
      margin-top: 0.5rem;
      animation: slideIn 0.3s ease-out;
    `;

    input.parentNode.appendChild(errorDiv);
    input.focus();

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) errorDiv.remove();
    }, 5000);
  }

  setLoadingState(isLoading) {
    const askButton = document.querySelector('.ask-btn');
    if (!askButton) return;

    this.loadingState.isLoading = isLoading;

    if (isLoading) {
      this.loadingState.startTime = Date.now();
      askButton.classList.add('loading');
      askButton.textContent = 'Thinking...';
      askButton.disabled = true;
      this.startProgressIndicators();
    } else {
      askButton.classList.remove('loading');
      askButton.textContent = 'Ask Sage';
      askButton.disabled = false;
      this.stopProgressIndicators();
    }
  }

  startProgressIndicators() {
    this.stopProgressIndicators(); // Clean up any existing

    const askButton = document.querySelector('.ask-btn');
    if (!askButton) return;

    // Animated dots
    let dotCount = 0;
    this.loadingState.progressTimer = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      const baseText = askButton.textContent.replace(/\.*$/, '');
      askButton.textContent = `${baseText}${'.'.repeat(dotCount)}`;
    }, 500);

    // Progressive messages
    const progressMessages = [
      { delay: 8000, text: 'Analyzing your request' },
      { delay: 20000, text: 'Gathering recommendations' },
      { delay: 35000, text: 'Finalizing results' },
      { delay: 55000, text: 'Almost ready' }
    ];

    progressMessages.forEach(({ delay, text }) => {
      const timer = setTimeout(() => {
        if (this.loadingState.isLoading) {
          askButton.textContent = `${text}...`;
        }
      }, delay);
      this.loadingState.stageTimers.push(timer);
    });
  }

  stopProgressIndicators() {
    if (this.loadingState.progressTimer) {
      clearInterval(this.loadingState.progressTimer);
      this.loadingState.progressTimer = null;
    }

    this.loadingState.stageTimers.forEach(timer => clearTimeout(timer));
    this.loadingState.stageTimers = [];
  }

  handleError(result) {
    const { error, message, fallbackAvailable } = result;

    // Show appropriate error UI based on error type
    switch (error) {
      case 'connection':
        this.showConnectionError(message);
        break;
      case 'timeout':
        this.showTimeoutError(message, fallbackAvailable);
        break;
      default:
        this.showGenericError(message);
    }
  }

  showConnectionError(message) {
    const errorDiv = this.createErrorNotification(message, 'error');
    
    // Add connection troubleshooting
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.innerHTML += `
          <div class="error-actions" style="margin-top: 10px; font-size: 0.8em;">
            <button onclick="window.Config.autoDiscoverHost().then(console.log)" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
              Try Auto-Connect
            </button>
            <button onclick="this.parentNode.parentNode.remove()" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
              Dismiss
            </button>
          </div>
        `;
      }
    }, 1000);
  }

  showTimeoutError(message, fallbackAvailable) {
    let fullMessage = message;
    if (fallbackAvailable) {
      fullMessage += ' You can try again or continue with limited results.';
    }
    
    this.createErrorNotification(fullMessage, 'warning');
  }

  showGenericError(message) {
    this.createErrorNotification(message, 'error');
  }

  createErrorNotification(message, type = 'error') {
    // Remove existing notifications
    document.querySelectorAll('.error-notification').forEach(el => el.remove());

    const colors = {
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${colors[type]};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 10000;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideInTop 0.3s ease-out;
    `;
    errorDiv.innerHTML = message;

    document.body.appendChild(errorDiv);

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.style.animation = 'slideOutTop 0.3s ease-in';
        setTimeout(() => errorDiv.remove(), 300);
      }
    }, 8000);

    return errorDiv;
  }

  addConnectionIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'connection-indicator';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #10b981;
      z-index: 1000;
      transition: background-color 0.3s ease;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
    `;
    
    document.body.appendChild(indicator);

    // Update indicator based on connection state
    setInterval(() => {
      const isConnected = this.dataService.isConnected();
      indicator.style.background = isConnected ? '#10b981' : '#ef4444';
      indicator.style.boxShadow = isConnected 
        ? '0 0 8px rgba(16, 185, 129, 0.5)' 
        : '0 0 8px rgba(239, 68, 68, 0.5)';
      indicator.title = isConnected 
        ? `Connected to ${this.dataService.getCurrentHost()}` 
        : 'Connection lost';
    }, 5000);
  }

  navigateToResults() {
    // Add exit animation before navigation
    document.body.style.transition = 'opacity 0.3s ease-out';
    document.body.style.opacity = '0';
    
    setTimeout(() => {
      window.location.href = 'products.html';
    }, 300);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.sageUIController = new SageUIController();
});

// Add necessary CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInTop {
    from { transform: translate(-50%, -100%); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  }
  
  @keyframes slideOutTop {
    from { transform: translate(-50%, 0); opacity: 1; }
    to { transform: translate(-50%, -100%); opacity: 0; }
  }
  
  @keyframes slideIn {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .ask-btn.loading {
    background: linear-gradient(45deg, #4ade80, #22c55e);
    cursor: not-allowed;
  }
  
  .validation-error {
    animation: slideIn 0.3s ease-out;
  }
`;
document.head.appendChild(style);