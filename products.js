/**
 * Copyright (c) 2025-2026 One Block Away LLC
 * All rights reserved. Proprietary and confidential.
 */

// Products Page Dynamic Content Handler
class ProductsPageHandler {
  constructor() {
    this.responseData = null;
    this.init();
  }

  init() {
    // Load stored response data
    this.loadResponseData();
    
    if (this.responseData) {
      this.populateContent();
    } else {
      this.handleMissingData();
    }

    // Add back navigation
    this.setupNavigation();
  }

  loadResponseData() {
    try {
      const storedData = sessionStorage.getItem('sageResponse');
      if (storedData) {
        this.responseData = JSON.parse(storedData);
        
        // Check if data is still fresh (within 30 minutes)
        const dataAge = Date.now() - this.responseData.timestamp;
        const maxAge = 30 * 60 * 1000; // 30 minutes
        
        if (dataAge > maxAge) {
          console.log('Response data expired, redirecting to home');
          this.redirectToHome();
          return;
        }
      }
    } catch (error) {
      console.error('Error loading response data:', error);
      this.handleMissingData();
    }
  }

  populateContent() {
    this.populateMainResponse();
    this.populateGuidanceCards();
    this.populateEnhancedProducts();
    this.addLoadingAnimations();
  }

  populateMainResponse() {
    // Update query display
    const queryText = document.querySelector('.query-text');
    if (queryText && this.responseData.userInput) {
      const displayText = this.responseData.userInput === 'demo' 
        ? `Demo mode for ${this.responseData.experienceLevel} users`
        : this.responseData.userInput;
      queryText.textContent = displayText;
    }

    // Populate structured sections
    this.populatePersonalizedRecommendations();
    this.populateCannabisScience();
    this.populateConsumptionDosing();
    // Safety section is static and already populated in HTML
  }

  populatePersonalizedRecommendations() {
    const data = this.responseData.personalizedRecommendations;
    if (!data) return;

    // Update intro text
    const sectionIntro = document.querySelector('.personalized-recommendations .section-intro');
    if (sectionIntro) {
      sectionIntro.textContent = data.intro;
    }

    // Update details
    const thcDetail = document.querySelector('.thc-detail');
    const cbdDetail = document.querySelector('.cbd-detail');
    const matchDetail = document.querySelector('.match-detail');
    const whyDetail = document.querySelector('.why-detail');

    if (thcDetail) thcDetail.textContent = data.thcLevel;
    if (cbdDetail) cbdDetail.textContent = data.cbdContent;
    if (matchDetail) matchDetail.textContent = data.bestMatch;
    if (whyDetail) whyDetail.textContent = data.whyTheseWork;
  }

  populateCannabisScience() {
    const scienceExplanation = document.querySelector('.science-explanation');
    if (scienceExplanation && this.responseData.cannabisScience) {
      scienceExplanation.textContent = this.responseData.cannabisScience;
    }
  }

  populateConsumptionDosing() {
    const dosingSteps = document.querySelector('.dosing-steps');
    if (dosingSteps && this.responseData.consumptionDosing) {
      dosingSteps.innerHTML = '';
      this.responseData.consumptionDosing.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        dosingSteps.appendChild(li);
      });
    }
  }

  populateGuidanceCards() {
    const guidanceCards = document.querySelectorAll('.guidance-card');
    const benefits = this.responseData.benefits;
    
    if (guidanceCards.length >= 3 && benefits.length >= 3) {
      benefits.forEach((benefit, index) => {
        if (guidanceCards[index]) {
          const titleElement = guidanceCards[index].querySelector('.card-title');
          const listElement = guidanceCards[index].querySelector('.guidance-list');
          
          if (titleElement && listElement) {
            titleElement.textContent = benefit.title;
            
            // Clear existing list items and add new ones
            listElement.innerHTML = '';
            benefit.points.forEach(point => {
              const li = document.createElement('li');
              li.textContent = point;
              listElement.appendChild(li);
            });
          }
        }
      });
    }
  }

  populateEnhancedProducts() {
    const enhancedCards = document.querySelectorAll('.enhanced-product-card');
    const products = this.responseData.products;
    
    if (enhancedCards.length >= 2 && products.length >= 2) {
      products.slice(0, 2).forEach((product, index) => {
        if (enhancedCards[index]) {
          this.populateEnhancedProductCard(enhancedCards[index], product);
        }
      });
    }
  }

  populateEnhancedProductCard(card, product) {
    // Update product type badge
    const typeBadge = card.querySelector('.product-type-badge');
    if (typeBadge) {
      typeBadge.textContent = product.type;
    }

    // Update product name
    const productName = card.querySelector('.product-name');
    if (productName) {
      productName.textContent = product.name;
    }

    // Update rating
    const ratingValue = card.querySelector('.rating-value');
    const stars = card.querySelector('.stars');
    if (ratingValue && product.rating) {
      ratingValue.textContent = product.rating.toFixed(1);
      
      if (stars) {
        const filledStars = Math.floor(product.rating);
        const hasHalfStar = product.rating % 1 !== 0;
        let starsHTML = '★'.repeat(filledStars);
        if (hasHalfStar) starsHTML += '☆';
        starsHTML += '☆'.repeat(5 - Math.ceil(product.rating));
        stars.innerHTML = starsHTML;
      }
    }

    // Update potency values
    const thcValue = card.querySelector('.thc .potency-value');
    const cbdValue = card.querySelector('.cbd .potency-value');
    if (thcValue) thcValue.textContent = product.thc;
    if (cbdValue) cbdValue.textContent = product.cbd;

    // Update strain info
    const strainName = card.querySelector('.strain-name');
    if (strainName && product.strain) {
      strainName.textContent = product.strain;
    }

    // Update effects tags
    const effectsTags = card.querySelector('.effects-tags');
    if (effectsTags && product.effects) {
      effectsTags.innerHTML = '';
      product.effects.forEach(effect => {
        const tag = document.createElement('span');
        tag.className = 'effect-tag';
        tag.textContent = effect;
        effectsTags.appendChild(tag);
      });
    }

    // Update description
    const description = card.querySelector('.product-description');
    if (description) {
      description.textContent = product.description;
    }

    // Update why this works section
    const whyExplanation = card.querySelector('.why-explanation');
    if (whyExplanation && product.whyThisWorks) {
      whyExplanation.textContent = product.whyThisWorks;
    }

    // Update price
    const price = card.querySelector('.price');
    if (price) {
      price.textContent = product.price;
    }

    // Update availability
    const availability = card.querySelector('.availability');
    if (availability && product.availability) {
      availability.textContent = product.availability;
      availability.className = `availability ${product.availability.toLowerCase().replace(' ', '-')}`;
    }

    // Make View at Dispensary button functional
    const dispensaryBtn = card.querySelector('.view-at-dispensary-btn');
    if (dispensaryBtn && product.dispensaryUrl) {
      dispensaryBtn.onclick = () => {
        window.open(product.dispensaryUrl, '_blank');
      };
      // Remove disabled state if it exists
      dispensaryBtn.disabled = false;
    }
  }

  formatResponse(response) {
    // Simple formatting for AI responses
    return response
      .split('\n\n')
      .map(paragraph => `<p>${paragraph.trim()}</p>`)
      .join('');
  }

  addLoadingAnimations() {
    // Add staggered fade-in animations for enhanced layout
    const elements = document.querySelectorAll('.main-response-card, .guidance-card, .enhanced-product-card, .recommendations-heading');
    
    elements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
      
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 200);
    });

    // Legacy support for old layout
    const legacyElements = document.querySelectorAll('.response-card, .subsection, .product-card');
    legacyElements.forEach((element, index) => {
      if (!element.closest('.main-response-card, .guidance-card, .enhanced-product-card')) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, index * 150);
      }
    });
  }

  handleMissingData() {
    const container = document.querySelector('.products-container');
    if (container) {
      container.innerHTML = `
        <div class="missing-data-message">
          <h2>No Sage Response Found</h2>
          <p>It looks like you haven't asked Sage a question yet, or your session has expired.</p>
          <button class="back-to-home-btn">Ask Sage a Question</button>
        </div>
      `;
      
      const backBtn = container.querySelector('.back-to-home-btn');
      if (backBtn) {
        backBtn.addEventListener('click', () => this.redirectToHome());
      }
    }
  }

  setupNavigation() {
    // Add a subtle back button
    const header = document.querySelector('.products-header');
    if (header && this.responseData) {
      const backButton = document.createElement('button');
      backButton.className = 'back-btn';
      backButton.innerHTML = '← Ask Another Question';
      backButton.addEventListener('click', () => this.redirectToHome());
      
      header.appendChild(backButton);
    }
  }

  redirectToHome() {
    // Clear stored data and redirect
    sessionStorage.removeItem('sageResponse');
    window.location.href = 'index.html';
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProductsPageHandler();
});