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
    // Now using the AI-generated response (cannabisScience) for personalized section
    const aiResponse = this.responseData.cannabisScience;
    if (!aiResponse) return;

    // Parse AI response into structured sections for better readability
    const sections = this.parseAIResponseForPersonalized(aiResponse);

    // Update summary text
    const summaryText = document.querySelector('.summary-text');
    if (summaryText) {
      summaryText.textContent = sections.summary || aiResponse.substring(0, 200) + '...';
    }

    // Update highlight sections with age-inclusive language
    const highlights = document.querySelectorAll('.highlight-text');
    if (highlights.length >= 3) {
      highlights[0].textContent = sections.whyThisWorks || this.getAgeInclusiveFallback('whyThisWorks');
      highlights[1].textContent = sections.whatToExpect || this.getAgeInclusiveFallback('whatToExpect');
      highlights[2].textContent = sections.gettingStarted || this.getAgeInclusiveFallback('gettingStarted');
    }
  }

  parseAIResponseForPersonalized(response) {
    // Smart parsing of AI response to extract key sections
    const sections = {
      summary: '',
      whyThisWorks: '',
      whatToExpect: '',
      gettingStarted: ''
    };

    // Extract first 1-2 sentences as summary
    const sentences = response.split('. ');
    sections.summary = sentences.slice(0, 2).join('. ') + '.';

    // Look for key phrases to populate sections
    if (response.toLowerCase().includes('because') || response.toLowerCase().includes('since')) {
      sections.whyThisWorks = this.extractSentencesContaining(response, ['because', 'since', 'reason']);
    }
    
    if (response.toLowerCase().includes('expect') || response.toLowerCase().includes('feel')) {
      sections.whatToExpect = this.extractSentencesContaining(response, ['expect', 'feel', 'experience']);
    }

    if (response.toLowerCase().includes('start') || response.toLowerCase().includes('begin')) {
      sections.gettingStarted = this.extractSentencesContaining(response, ['start', 'begin', 'first']);
    }

    return sections;
  }

  extractSentencesContaining(text, keywords) {
    const sentences = text.split('. ');
    const matches = sentences.filter(sentence => 
      keywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );
    return matches.length > 0 ? matches[0] + '.' : '';
  }

  getAgeInclusiveFallback(section) {
    // Age-inclusive fallback content with confidence-building language
    const fallbacks = {
      whyThisWorks: "These products are carefully chosen based on your specific needs and experience level. Many people find this approach helps them feel more confident about their choices.",
      whatToExpect: "You can expect gentle, predictable effects that work well for your situation. It's normal to feel curious or even a bit nervous - that's completely okay.",
      gettingStarted: "Start slow and go at your own pace. There's no rush, and you're in complete control. Many people find it helpful to begin on a day when you have no other commitments."
    };
    return fallbacks[section] || "We're here to support you every step of the way.";
  }

  populateCannabisScience() {
    // Now using the structured personalizedRecommendations data for science section
    const data = this.responseData.personalizedRecommendations;
    if (!data) return;

    // Update THC badge
    const thcValue = document.querySelector('.thc-value');
    if (thcValue) {
      thcValue.textContent = data.thcLevel || 'N/A';
    }

    // Update CBD badge
    const cbdValue = document.querySelector('.cbd-value');
    if (cbdValue) {
      cbdValue.textContent = data.cbdContent || 'N/A';
    }

    // Update strain match
    const strainMatch = document.querySelector('.strain-match');
    if (strainMatch) {
      strainMatch.textContent = data.bestMatch || 'Loading...';
    }

    // Update scientific reasoning
    const scientificReasoning = document.querySelector('.scientific-reasoning');
    if (scientificReasoning) {
      // Make the "why these work" explanation more scientific and educational
      const reasoning = data.whyTheseWork || 'Based on the chemical profile and your needs.';
      scientificReasoning.textContent = this.makeMoreScientific(reasoning);
    }
  }

  makeMoreScientific(explanation) {
    // Add scientific context to make explanations more educational
    if (!explanation) return 'Chemical compounds interact with your endocannabinoid system to produce targeted effects.';
    
    // Add scientific framing to the explanation
    const scientificIntro = 'The cannabinoid profile works because ';
    return scientificIntro + explanation.toLowerCase();
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
    
    // Update price in CTA button
    const ctaBtn = card.querySelector('.get-product-btn');
    if (ctaBtn && product.price) {
      ctaBtn.textContent = `Get This Product (${product.price})`;
    }

    // Update availability
    const availability = card.querySelector('.availability');
    if (availability && product.availability) {
      availability.textContent = product.availability;
      availability.className = `availability ${product.availability.toLowerCase().replace(' ', '-')}`;
    }

    // Make CTA buttons functional
    const getProdBtn = card.querySelector('.get-product-btn');
    if (getProdBtn && product.dispensaryUrl) {
      getProdBtn.onclick = () => {
        window.open(product.dispensaryUrl, '_blank');
      };
      getProdBtn.disabled = false;
    }
    
    const saveBtn = card.querySelector('.save-later-btn');
    if (saveBtn) {
      saveBtn.onclick = () => {
        // Add to favorites/saved items functionality
        console.log('Save product for later:', product.name);
        saveBtn.textContent = 'Saved ✓';
        setTimeout(() => {
          saveBtn.textContent = 'Save for Later';
        }, 2000);
      };
    }

    // Legacy support - keep existing button working
    const dispensaryBtn = card.querySelector('.view-at-dispensary-btn');
    if (dispensaryBtn && product.dispensaryUrl) {
      dispensaryBtn.onclick = () => {
        window.open(product.dispensaryUrl, '_blank');
      };
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