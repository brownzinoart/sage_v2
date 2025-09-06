/**
 * Copyright (c) 2025-2026 One Block Away LLC
 * All rights reserved. Proprietary and confidential.
 */

// Rotating placeholder suggestions for Sage input
class PlaceholderRotator {
  constructor(inputElement) {
    this.input = inputElement;
    this.isRotating = true;
    this.currentIndex = 0;
    
    this.suggestions = [
      "Never been to a dispensary before...",
      "What are you hoping to feel or learn today?",
      "My knee is killing me",
      "Haven't slept in days", 
      "Going to the movies tonight",
      "4 day bachelorette party - what should we get?",
      "Need something for creative work",
      "Anxious about flying tomorrow",
      "Looking for a mellow evening",
      "First time trying edibles",
      "Help with post-workout recovery",
      "What's good for social anxiety?",
      "Need energy but not jittery",
      "Something to help me focus",
      "Planning a chill night in",
      "Dealing with chronic pain",
      "Want to try something new",
      "Best strains for beginners?",
      "How much should I take?",
      "What's the difference between indica and sativa?"
    ];
    
    this.init();
  }
  
  init() {
    // Set initial placeholder
    this.input.placeholder = this.suggestions[0];
    
    // Start rotation
    this.startRotation();
    
    // Handle focus - clear placeholder with smooth transition
    this.input.addEventListener('focus', () => {
      this.stopRotation();
      // Clear placeholder after focus transition starts
      setTimeout(() => {
        this.input.placeholder = '';
        this.updateFocusedEmptyState();
      }, 50);
    });
    
    // Handle input - smooth cursor hiding when typing starts
    this.input.addEventListener('input', () => {
      this.stopRotation();
      if (this.input.value.length > 0 && this.input.classList.contains('focused-empty')) {
        this.input.classList.add('cursor-hiding');
        setTimeout(() => {
          this.input.classList.remove('focused-empty', 'cursor-hiding');
        }, 300);
      } else {
        this.updateFocusedEmptyState();
      }
    });
    
    // Handle blur - smooth placeholder restoration
    this.input.addEventListener('blur', () => {
      this.input.classList.remove('focused-empty', 'cursor-visible', 'cursor-hiding');
      if (this.input.value === '') {
        this.currentIndex = 0;
        // Add placeholder-returning class for fade-in animation
        this.input.classList.add('placeholder-returning');
        this.input.placeholder = this.suggestions[0];
        
        // Remove the animation class after animation completes
        setTimeout(() => {
          this.input.classList.remove('placeholder-returning');
        }, 600);
        
        // Start rotation after smooth transition
        setTimeout(() => this.startRotation(), 1500);
      }
    });
  }
  
  updateFocusedEmptyState() {
    if (document.activeElement === this.input && this.input.value === '') {
      this.input.classList.add('focused-empty');
      // Add cursor-visible class after a brief delay for smooth fade-in
      setTimeout(() => {
        if (this.input.classList.contains('focused-empty')) {
          this.input.classList.add('cursor-visible');
        }
      }, 100);
    } else {
      this.input.classList.remove('focused-empty', 'cursor-visible');
    }
  }
  
  startRotation() {
    if (this.rotationInterval) return;
    
    this.isRotating = true;
    this.rotationInterval = setInterval(() => {
      if (this.isRotating && this.input.value === '' && document.activeElement !== this.input) {
        this.nextSuggestion();
      }
    }, 4000); // Change every 4 seconds for better readability
  }
  
  stopRotation() {
    this.isRotating = false;
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
  }
  
  nextSuggestion() {
    // Add transitioning class for placeholder-only animation
    this.input.classList.add('placeholder-transitioning');
    
    setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.suggestions.length;
      this.input.placeholder = this.suggestions[this.currentIndex];
      
      // Remove transitioning class after text change
      setTimeout(() => {
        this.input.classList.remove('placeholder-transitioning');
      }, 50);
    }, 200);
  }
}

// Experience level button handler
class ExperienceSelector {
  constructor() {
    this.buttons = document.querySelectorAll('.experience-selector button');
    this.selectedLevel = null;
    this.init();
  }
  
  init() {
    this.buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.selectLevel(e.target);
      });
    });
  }
  
  selectLevel(selectedButton) {
    // Remove selected class from all buttons
    this.buttons.forEach(btn => btn.classList.remove('selected'));
    
    // Add selected class to clicked button
    selectedButton.classList.add('selected');
    
    // Store selected level
    this.selectedLevel = selectedButton.textContent.toLowerCase();
    
    // Optional: You can dispatch a custom event here for other components
    document.dispatchEvent(new CustomEvent('experienceLevelChanged', {
      detail: { level: this.selectedLevel }
    }));
  }
  
  getSelectedLevel() {
    return this.selectedLevel;
  }
}

// Sage Form Handler
class SageFormHandler {
  constructor() {
    this.sageAPI = new SageAPI();
    this.experienceSelector = null;
    this._progressTimers = [];
    this._progressTicker = null;
    this.init();
  }

  init() {
    const askButton = document.querySelector('.ask-btn');
    const promptInput = document.querySelector('.prompt-input');

    if (askButton && promptInput) {
      askButton.addEventListener('click', (e) => this.handleSubmit(e));
      
      // Allow Enter key to submit
      promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSubmit(e);
        }
      });
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const promptInput = document.querySelector('.prompt-input');
    const askButton = document.querySelector('.ask-btn');
    const userInput = promptInput.value.trim();
    
    if (!userInput) {
      promptInput.focus();
      return;
    }

    // Get selected experience level
    const experienceLevel = this.experienceSelector?.getSelectedLevel() || 'casual';
    
    // Check if this is demo mode
    if (userInput.toLowerCase() === 'demo') {
      this.handleDemoMode(experienceLevel);
      return;
    }
    
    // Show loading state
    this.setLoadingState(askButton, true);
    
    try {
      console.log(`=== STARTING REQUEST FLOW ===`);
      console.log(`Input: "${userInput}"`);
      console.log(`Experience: ${experienceLevel}`);
      
      // EMERGENCY BYPASS: Skip API connectivity test
      console.log('EMERGENCY MODE: Bypassing API connectivity test');
      
      // Generate AI response and get recommendations
      console.log('Starting parallel API calls...');
      const [aiResponse, benefits, products] = await Promise.all([
        this.sageAPI.generateResponse(userInput, experienceLevel),
        this.sageAPI.getBenefitsForExperience(experienceLevel),
        this.sageAPI.getProductRecommendations(userInput, experienceLevel)
      ]);

      console.log(`=== API RESPONSES RECEIVED ===`);
      console.log(`AI Response type: ${typeof aiResponse}`);
      console.log(`AI Response length: ${aiResponse?.length || 'N/A'}`);
      console.log(`AI Response preview: ${aiResponse?.substring(0, 100) || 'N/A'}...`);
      console.log(`Benefits count: ${benefits?.length || 'N/A'}`);
      console.log(`Products count: ${products?.length || 'N/A'}`);

      // Get demo data structure for this experience level to use as template
      const demoData = this.sageAPI.getDemoData(experienceLevel);
      
      // Store data for products page - simplified structure for new MVP flow
      const responseData = {
        userInput,
        experienceLevel,
        aiResponse, // This is the structured MCP response
        benefits,
        products,
        timestamp: Date.now(),
        isDemo: false
      };
      
      console.log(`=== STORING IN SESSION STORAGE ===`);
      console.log('Response data structure:', {
        userInput: responseData.userInput,
        experienceLevel: responseData.experienceLevel,
        aiResponseLength: responseData.aiResponse?.length || 'N/A',
        benefitsCount: responseData.benefits?.length || 'N/A',
        productsCount: responseData.products?.length || 'N/A',
        isDemo: responseData.isDemo
      });
      
      sessionStorage.setItem('sageResponse', JSON.stringify(responseData));
      console.log('Session storage updated successfully');
      
      // Navigate to products page
      console.log('Navigating to products.html...');
      // Stop progress hints before navigating
      this.setLoadingState(askButton, false);
      window.location.href = 'products.html';
      
    } catch (error) {
      console.error('Error generating response:', error);
      this.handleError(askButton, error);
    }
  }

  handleDemoMode(experienceLevel) {
    console.log('Demo mode activated for experience level:', experienceLevel);
    
    // Get demo data immediately
    const demoData = this.sageAPI.getDemoData(experienceLevel);
    
    // Store demo data for products page
    const responseData = {
      userInput: 'demo',
      experienceLevel,
      aiResponse: demoData.aiResponse,
      benefits: demoData.benefits,
      products: demoData.products,
      // Add the structured data that the frontend expects
      personalizedRecommendations: demoData.personalizedRecommendations,
      cannabisScience: demoData.cannabisScience,
      consumptionDosing: demoData.consumptionDosing,
      timestamp: Date.now(),
      isDemo: true
    };
    
    sessionStorage.setItem('sageResponse', JSON.stringify(responseData));
    
    // Navigate to products page
    window.location.href = 'products.html';
  }

  setLoadingState(button, isLoading) {
    if (isLoading) {
      button.classList.add('loading');
      button.textContent = 'Thinking...';
      button.disabled = true;
      this.startProgressHints(button);
    } else {
      button.classList.remove('loading');
      button.textContent = 'Ask Sage';
      button.disabled = false;
      this.stopProgressHints();
    }
  }

  handleError(button, error) {
    this.setLoadingState(button, false);
    
    // Show user-friendly error message
    const errorMessage = error.message.includes('API') 
      ? 'AI service temporarily unavailable. Please try again.'
      : 'Something went wrong. Please try again.';
    
    // Create temporary error display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = errorMessage;
    errorDiv.style.cssText = `
      color: #ff4757;
      text-align: center;
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(255, 71, 87, 0.1);
      border-radius: 8px;
      border: 1px solid rgba(255, 71, 87, 0.3);
    `;
    
    button.parentNode.appendChild(errorDiv);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  setExperienceSelector(selector) {
    this.experienceSelector = selector;
  }

  // Progress hint helpers
  startProgressHints(button) {
    // Clear any existing timers just in case
    this.stopProgressHints();

    // Animated ellipsis on the current label
    let dots = 0;
    const baseText = () => button.textContent.replace(/\.*$/, '');
    this._progressTicker = setInterval(() => {
      dots = (dots + 1) % 4; // 0..3 dots
      const txt = baseText();
      button.textContent = `${txt}${'.'.repeat(dots)}`;
    }, 500);

    // Staged, reassuring messages over time
    const stages = [
      { t: 8000,  text: 'Still thinking — gathering details' },
      { t: 20000, text: 'Analyzing your request' },
      { t: 35000, text: 'Composing recommendations' },
      { t: 55000, text: 'Almost there — finalizing' },
      { t: 90000, text: 'Big question — taking a bit longer' },
      { t: 120000, text: 'Thanks for your patience — refining results' }
    ];

    stages.forEach(stage => {
      const id = setTimeout(() => {
        // Preserve current dots animation; replace the base label
        dots = 0;
        button.textContent = stage.text + '...';
      }, stage.t);
      this._progressTimers.push(id);
    });
  }

  stopProgressHints() {
    if (this._progressTicker) {
      clearInterval(this._progressTicker);
      this._progressTicker = null;
    }
    this._progressTimers.forEach(id => clearTimeout(id));
    this._progressTimers = [];
  }

  // Background warm-up to reduce first-call latency
  async warmUpModel() {
    try {
      await this.sageAPI.warmUp();
    } catch (_) {
      // Silent: warm-up is best effort
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.querySelector('.prompt-input');
  if (promptInput) {
    new PlaceholderRotator(promptInput);
  }
  
  // Initialize experience selector
  const experienceSelector = new ExperienceSelector();
  
  // Initialize form handler
  const formHandler = new SageFormHandler();
  formHandler.setExperienceSelector(experienceSelector);
  // Kick off a background warm-up (best effort)
  formHandler.warmUpModel();
  
  // Configure video background
  const video = document.querySelector('.video-bg');
  if (video) {
    // Smooth meditative playback
    video.playbackRate = 0.75;
    
    // Simple seamless looping without fade flashing
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.play();
    });
    
    // Handle any loading issues gracefully
    video.addEventListener('error', () => {
      console.log('Video background failed to load, falling back to gradient only');
      video.style.display = 'none';
    });
  }
});
