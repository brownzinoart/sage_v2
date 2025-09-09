/**
 * Copyright (c) 2025-2026 One Block Away LLC
 * All rights reserved. Proprietary and confidential.
 * 
 * Results Controller - Manages the products/results page display and interactions
 */

class SageResultsController {
  constructor() {
    this.dataService = new SageDataService();
    this.responseData = null;
    this.isLoading = true;
    this.init();
  }

  init() {
    this.setupNavigation();
    this.loadAndDisplayResults();
  }

  async loadAndDisplayResults() {
    try {
      // Try to get cached response first
      this.responseData = this.dataService.getCachedResponse();
      
      if (!this.responseData) {
        this.handleMissingData();
        return;
      }

      // Display the results
      await this.displayResults();
      this.setupInteractions();
      
    } catch (error) {
      console.error('Error loading results:', error);
      this.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }

  async displayResults() {
    // Update page title and meta
    this.updatePageMeta();

    // Display user query
    this.displayUserQuery();

    // Display guidance sections in parallel
    await Promise.all([
      this.displayPersonalizedRecommendations(),
      this.displayCannabisScience(),
      this.displayConsumptionDosing(),
      this.displayActionableCards(),
      this.displayProductRecommendations()
    ]);

    // Add entrance animations
    this.addEntranceAnimations();
  }

  updatePageMeta() {
    const { userInput, experienceLevel } = this.responseData;
    document.title = `Sage Advice: ${experienceLevel} guidance`;
    
    // Add meta for better accessibility
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = `Personalized cannabis guidance for: ${userInput}`;
    document.head.appendChild(meta);
  }

  displayUserQuery() {
    const queryElement = document.querySelector('.query-text');
    if (queryElement) {
      queryElement.textContent = this.responseData.userInput;
    }
  }

  displayPersonalizedRecommendations() {
    const section = document.querySelector('.personalized-recommendations');
    if (!section) return;

    try {
      const recommendations = this.extractRecommendations();
      
      // Update intro text
      const intro = section.querySelector('.section-intro');
      if (intro) intro.textContent = recommendations.intro;

      // Update detail items
      const details = {
        'thc-detail': recommendations.thcLevel,
        'cbd-detail': recommendations.cbdContent, 
        'match-detail': recommendations.bestMatch,
        'why-detail': recommendations.reasoning
      };

      Object.entries(details).forEach(([className, value]) => {
        const element = section.querySelector(`.${className}`);
        if (element && value) element.textContent = value;
      });

    } catch (error) {
      console.warn('Error displaying recommendations:', error);
      this.displayFallbackRecommendations(section);
    }
  }

  displayCannabisScience() {
    const section = document.querySelector('.cannabis-science');
    if (!section) return;

    try {
      const science = this.extractScience();
      const explanationEl = section.querySelector('.science-explanation');
      if (explanationEl) {
        explanationEl.innerHTML = this.formatScience(science);
      }
    } catch (error) {
      console.warn('Error displaying science:', error);
      this.displayFallbackScience(section);
    }
  }

  displayConsumptionDosing() {
    const section = document.querySelector('.consumption-dosing');
    if (!section) return;

    try {
      const dosing = this.extractDosing();
      const stepsEl = section.querySelector('.dosing-steps');
      if (stepsEl) {
        stepsEl.innerHTML = dosing.map(step => `<li>${step}</li>`).join('');
      }
    } catch (error) {
      console.warn('Error displaying dosing:', error);
      this.displayFallbackDosing(section);
    }
  }

  displayActionableCards() {
    try {
      const actionable = this.extractActionableGuidance();
      
      // Quick Tips Card
      this.updateCard('.quick-tips-card', actionable.quickTips);
      
      // Preparation Card
      this.updateCard('.preparation-card', actionable.preparation);
      
      // Where to Buy Card
      this.updateCard('.where-to-buy-card', actionable.whereToBuy);
      
    } catch (error) {
      console.warn('Error displaying actionable cards:', error);
      this.displayFallbackCards();
    }
  }

  updateCard(selector, data) {
    const card = document.querySelector(selector);
    if (!card || !data) return;

    const list = card.querySelector('.guidance-list');
    if (list) {
      list.innerHTML = data.map(item => `<li>${item}</li>`).join('');
    }
  }

  async displayProductRecommendations() {
    const container = document.querySelector('.product-cards');
    if (!container || !this.responseData.products) return;

    try {
      // Clear loading placeholders
      container.innerHTML = '';

      // Create product cards
      this.responseData.products.forEach((product, index) => {
        const card = this.createProductCard(product, index);
        container.appendChild(card);
      });

      // If no products, show helpful message
      if (this.responseData.products.length === 0) {
        this.showNoProductsMessage(container);
      }

    } catch (error) {
      console.warn('Error displaying products:', error);
      this.showProductError(container);
    }
  }

  createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'enhanced-product-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
      <div class="product-image-placeholder">
        <div class="placeholder-gradient"></div>
        <div class="product-type-badge">${product.type || 'Cannabis'}</div>
      </div>
      <div class="product-info">
        <div class="product-header">
          <h3 class="product-name">${product.name || 'Premium Product'}</h3>
          <div class="product-rating">
            <div class="stars">${this.generateStars(product.rating || 4.5)}</div>
            <span class="rating-value">${product.rating || '4.5'}</span>
          </div>
        </div>
        <div class="product-details">
          <div class="potency-display">
            <div class="potency-item thc">
              <span class="potency-label">THC</span>
              <span class="potency-value">${product.thc || '--'}%</span>
            </div>
            <div class="potency-item cbd">
              <span class="potency-label">CBD</span>
              <span class="potency-value">${product.cbd || '--'}%</span>
            </div>
          </div>
          <div class="strain-info">
            <span class="strain-label">Strain:</span>
            <span class="strain-name">${product.strain || 'Hybrid'}</span>
          </div>
          <div class="effects-tags">
            ${(product.effects || ['Relaxing']).map(effect => 
              `<span class="effect-tag">${effect}</span>`
            ).join('')}
          </div>
          <p class="product-description">${product.description || 'Quality cannabis product selected for your needs.'}</p>
          <div class="why-this-works">
            <div class="why-header">
              <span class="why-icon">🎯</span>
              <h4>Why This Works for You</h4>
            </div>
            <p class="why-explanation">${product.personalizedReason || 'This product matches your experience level and desired effects.'}</p>
          </div>
        </div>
        <div class="product-footer">
          <div class="pricing">
            <span class="price">${product.price || '$25-45'}</span>
            <span class="availability ${product.inStock !== false ? 'in-stock' : 'out-of-stock'}">
              ${product.inStock !== false ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          <button class="view-at-dispensary-btn" ${product.inStock === false ? 'disabled' : ''}>
            View at Dispensary
          </button>
        </div>
      </div>
    `;

    return card;
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars);
  }

  // Data extraction methods
  extractRecommendations() {
    const { aiResponse } = this.responseData;
    
    // Try to parse structured response first
    if (this.responseData.personalizedRecommendations) {
      return this.responseData.personalizedRecommendations;
    }

    // Fallback: extract from AI response
    return this.parseRecommendationsFromText(aiResponse);
  }

  extractScience() {
    if (this.responseData.cannabisScience) {
      return this.responseData.cannabisScience;
    }

    return this.parseScienceFromText(this.responseData.aiResponse);
  }

  extractDosing() {
    if (this.responseData.consumptionDosing) {
      return this.responseData.consumptionDosing;
    }

    return this.parseDosingFromText(this.responseData.aiResponse);
  }

  extractActionableGuidance() {
    // Use benefits data as base, enhance with AI response
    const benefits = this.responseData.benefits || [];
    
    return {
      quickTips: this.extractSection(benefits, 'quick tips') || 
                ['Start with lower doses', 'Stay hydrated', 'Keep snacks ready'],
      preparation: this.extractSection(benefits, 'preparation') ||
                   ['Clear your schedule', 'Set up comfortable space', 'Have a trusted friend nearby'],
      whereToBuy: this.extractSection(benefits, 'where to buy') ||
                  ['Licensed dispensaries only', 'Ask budtenders for guidance', 'Check lab testing certificates']
    };
  }

  extractSection(benefits, sectionName) {
    const section = benefits.find(b => 
      b.title.toLowerCase().includes(sectionName.toLowerCase()) ||
      Object.keys(b).some(key => key.toLowerCase().includes(sectionName))
    );
    
    return section?.points || null;
  }

  // Text parsing fallbacks
  parseRecommendationsFromText(text) {
    return {
      intro: 'Based on your input, here are personalized recommendations.',
      thcLevel: 'Moderate (10-20%)',
      cbdContent: 'Balanced ratio',
      bestMatch: 'Hybrid strains',
      reasoning: 'Suitable for your experience level and goals.'
    };
  }

  parseScienceFromText(text) {
    return 'Cannabis contains cannabinoids that interact with your endocannabinoid system to produce various effects.';
  }

  parseDosingFromText(text) {
    return [
      'Start with the lowest recommended dose',
      'Wait at least 2 hours before consuming more',
      'Keep a consumption journal',
      'Stay in a comfortable environment'
    ];
  }

  // Fallback content methods
  displayFallbackRecommendations(section) {
    const intro = section.querySelector('.section-intro');
    if (intro) intro.textContent = 'Personalized recommendations based on your experience level.';
  }

  displayFallbackScience(section) {
    const explanation = section.querySelector('.science-explanation');
    if (explanation) {
      explanation.textContent = 'Cannabis works through the endocannabinoid system to produce various therapeutic and recreational effects.';
    }
  }

  displayFallbackDosing(section) {
    const steps = section.querySelector('.dosing-steps');
    if (steps) {
      steps.innerHTML = `
        <li>Start with the smallest recommended dose</li>
        <li>Wait 2-3 hours before taking more</li>
        <li>Keep track of effects in a journal</li>
        <li>Stay in a comfortable, familiar environment</li>
      `;
    }
  }

  displayFallbackCards() {
    // Set fallback content for cards if needed
    this.updateCard('.quick-tips-card', [
      'Start low and go slow',
      'Stay hydrated',
      'Have snacks ready'
    ]);
  }

  // Animation and interaction methods
  addEntranceAnimations() {
    const sections = document.querySelectorAll('.guidance-section, .guidance-card, .enhanced-product-card');
    
    sections.forEach((section, index) => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      
      setTimeout(() => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  setupInteractions() {
    // Add click handlers for product cards
    document.querySelectorAll('.view-at-dispensary-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleDispensaryClick(button);
      });
    });

    // Add research link handler
    const researchLink = document.querySelector('.research-link');
    if (researchLink) {
      researchLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showResearchModal();
      });
    }
  }

  setupNavigation() {
    // Add back button functionality
    const backButton = document.createElement('button');
    backButton.innerHTML = '← Back to Search';
    backButton.className = 'back-button';
    backButton.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      z-index: 1000;
    `;

    backButton.addEventListener('click', () => {
      window.location.href = 'index.html';
    });

    backButton.addEventListener('mouseover', () => {
      backButton.style.background = 'rgba(255, 255, 255, 0.2)';
    });

    backButton.addEventListener('mouseout', () => {
      backButton.style.background = 'rgba(255, 255, 255, 0.1)';
    });

    document.body.appendChild(backButton);
  }

  // Error handling
  handleMissingData() {
    const message = document.createElement('div');
    message.className = 'missing-data-message';
    message.style.cssText = `
      text-align: center;
      padding: 2rem;
      color: white;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      margin: 2rem;
    `;
    
    message.innerHTML = `
      <h2>No Results Available</h2>
      <p>It looks like you navigated here directly. Please start a new search to get personalized recommendations.</p>
      <button onclick="window.location.href='index.html'" style="
        background: linear-gradient(45deg, #4ade80, #22c55e);
        border: none;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        margin-top: 1rem;
      ">Start New Search</button>
    `;

    const container = document.querySelector('.products-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(message);
    }
  }

  handleError(error) {
    console.error('Results controller error:', error);
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'results-error';
    errorMessage.innerHTML = `
      <h2>Unable to Load Results</h2>
      <p>There was an error loading your personalized recommendations. Please try searching again.</p>
      <button onclick="window.location.href='index.html'">Return to Search</button>
    `;

    const container = document.querySelector('.products-container');
    if (container) container.appendChild(errorMessage);
  }

  handleDispensaryClick(button) {
    // Simulate dispensary redirect (implement actual integration)
    button.textContent = 'Redirecting...';
    setTimeout(() => {
      alert('This would redirect to the dispensary partner. Integration pending.');
      button.textContent = 'View at Dispensary';
    }, 1000);
  }

  showResearchModal() {
    // Simple modal for research insights
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    modal.innerHTML = `
      <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 500px; margin: 1rem;">
        <h3>Research-Based Recommendations</h3>
        <p>Our recommendations are based on peer-reviewed research, clinical studies, and expert knowledge in cannabis science.</p>
        <button onclick="this.closest('div').parentNode.remove()" style="
          background: #4ade80;
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 1rem;
        ">Close</button>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  formatScience(science) {
    if (typeof science === 'string') {
      return science;
    }
    
    // Handle structured science data
    return science.explanation || 'Cannabis science information is being processed.';
  }

  showNoProductsMessage(container) {
    container.innerHTML = `
      <div class="no-products-message" style="
        text-align: center;
        padding: 2rem;
        color: rgba(255, 255, 255, 0.8);
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        margin: 1rem 0;
      ">
        <h3>No Specific Products Available</h3>
        <p>Based on your query, we recommend speaking with a knowledgeable budtender at your local licensed dispensary for personalized product selection.</p>
      </div>
    `;
  }

  showProductError(container) {
    container.innerHTML = `
      <div class="product-error" style="
        text-align: center;
        padding: 1rem;
        color: #ff6b6b;
        background: rgba(255, 107, 107, 0.1);
        border-radius: 8px;
        margin: 1rem 0;
      ">
        Error loading product recommendations. Please refresh the page.
      </div>
    `;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('products.html')) {
    window.sageResultsController = new SageResultsController();
  }
});