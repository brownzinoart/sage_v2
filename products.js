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
        
        console.log('=== CHECKING CACHED RESPONSE ===');
        console.log('Cached AI Response preview:', this.responseData.aiResponse?.substring(0, 100) + '...');
        
        // Check if this is old fallback data (contains the fallback text)
        const isFallbackData = this.responseData.aiResponse && (
          this.responseData.aiResponse.includes('Your question requires personalized cannabis guidance') ||
          this.responseData.aiResponse.includes('Your cannabis query needs our full recommendation engine') ||
          this.responseData.aiResponse.includes('Your advanced cannabis query requires our comprehensive analysis system')
        );
        
        if (isFallbackData) {
          console.warn('=== DETECTED OLD FALLBACK DATA IN CACHE ===');
          console.warn('Clearing cache and redirecting to make fresh API call...');
          
          // Clear all potential cached data
          sessionStorage.clear();
          localStorage.removeItem('OLLAMA_HOST'); // Force reload of config
          
          alert('Detected old cached fallback data. Redirecting to homepage to make a fresh API call with the fixed CORS connection.');
          
          // Force redirect with immediate execution
          setTimeout(() => {
            window.location.replace('index.html');
          }, 100);
          return;
        }
        
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

    // Populate new MVP structured sections
    this.populateAdaptiveContent();
    // Safety section is static and already populated in HTML
  }

  populateAdaptiveContent() {
    console.log(`=== POPULATING ADAPTIVE CONTENT ===`);
    
    // Parse the structured MCP response
    const aiResponse = this.responseData.aiResponse;
    console.log(`AI Response type: ${typeof aiResponse}`);
    console.log(`AI Response length: ${aiResponse?.length || 'N/A'}`);
    
    if (!aiResponse) {
      console.error('No AI response found in responseData');
      console.log('Full responseData:', this.responseData);
      return;
    }

    // Check if this is a fallback response
    const isFallbackResponse = aiResponse.includes('Your question requires personalized cannabis guidance') ||
                              aiResponse.includes('Your cannabis query needs our full recommendation engine') ||
                              aiResponse.includes('Your advanced cannabis query requires our comprehensive analysis system');
    
    if (isFallbackResponse) {
      console.warn('=== DETECTED FALLBACK RESPONSE ===');
      console.warn('This means the MCP/Ollama call failed and fell back to generic text');
      console.warn('Fallback content:', aiResponse);
    }

    // Parse structured sections from MCP response
    const sections = this.parseStructuredResponse(aiResponse);
    
    // Apply experience-level CSS class to main container
    const mainCard = document.querySelector('.main-response-card');
    if (mainCard) {
      mainCard.classList.add(`experience-${this.responseData.experienceLevel}`);
    }

    // Enhanced debug logging
    console.log(`=== RESPONSE ANALYSIS ===`);
    console.log(`AI Response preview:`, aiResponse.substring(0, 300));
    console.log(`Experience Level:`, this.responseData.experienceLevel);
    console.log(`Is Fallback Response:`, isFallbackResponse);
    console.log(`Parsed sections:`, sections);
    
    // Populate each section
    console.log('Populating sections...');
    this.populateIntroduction(sections.introduction);
    this.populateCoreTopic(sections.coreTopic);
    this.populateWhyThisWorks(sections.whyThisWorks);
    this.populateWhatToExpect(sections.whatToExpect);
    this.populateGettingStarted(sections.gettingStarted);
    console.log('Section population complete');
  }

  parseStructuredResponse(response) {
    console.log(`=== PARSING STRUCTURED RESPONSE ===`);
    console.log('Full response length:', response.length);
    console.log('Response preview:', response.substring(0, 300) + '...');
    
    // Parse MCP structured response with section markers
    const sections = {
      introduction: '',
      coreTopic: '',
      whyThisWorks: '',
      whatToExpect: '',
      gettingStarted: ''
    };

    // First, try to extract sections using markers
    console.log('Looking for section markers...');
    const introMatch = response.match(/\[INTRODUCTION\]\s*([\s\S]*?)(?=\[|$)/);
    const coreMatch = response.match(/\[CORE_TOPIC\]\s*([\s\S]*?)(?=\[|$)/);
    const whyMatch = response.match(/\[WHY_THIS_WORKS\]\s*([\s\S]*?)(?=\[|$)/);
    const expectMatch = response.match(/\[WHAT_TO_EXPECT\]\s*([\s\S]*?)(?=\[|$)/);
    const startMatch = response.match(/\[GETTING_STARTED\]\s*([\s\S]*?)(?=\[|$)/);

    console.log('Section marker matches:', {
      introMatch: !!introMatch,
      coreMatch: !!coreMatch,
      whyMatch: !!whyMatch,
      expectMatch: !!expectMatch,
      startMatch: !!startMatch
    });

    // Check if we found structured sections
    const hasStructuredContent = introMatch || coreMatch || whyMatch || expectMatch || startMatch;
    
    if (hasStructuredContent) {
      console.log('=== FOUND STRUCTURED CONTENT ===');
      sections.introduction = introMatch ? introMatch[1].trim() : this.getFallbackContent('introduction');
      sections.coreTopic = coreMatch ? coreMatch[1].trim() : this.getFallbackContent('coreTopic');
      sections.whyThisWorks = whyMatch ? whyMatch[1].trim() : this.getFallbackContent('whyThisWorks');
      sections.whatToExpect = expectMatch ? expectMatch[1].trim() : this.getFallbackContent('whatToExpect');
      sections.gettingStarted = startMatch ? startMatch[1].trim() : this.getFallbackContent('gettingStarted');
      
      console.log('Extracted sections:', {
        introLength: sections.introduction.length,
        coreLength: sections.coreTopic.length,
        whyLength: sections.whyThisWorks.length,
        expectLength: sections.whatToExpect.length,
        startedLength: sections.gettingStarted.length
      });
    } else {
      console.log('=== NO STRUCTURED MARKERS FOUND ===');
      console.log('Parsing as unstructured response...');
      // Parse unstructured response intelligently
      const unstructuredSections = this.parseUnstructuredResponse(response);
      sections.introduction = unstructuredSections.introduction;
      sections.coreTopic = unstructuredSections.coreTopic;
      sections.whyThisWorks = unstructuredSections.whyThisWorks;
      sections.whatToExpect = unstructuredSections.whatToExpect;
      sections.gettingStarted = unstructuredSections.gettingStarted;
    }

    return sections;
  }
  
  parseUnstructuredResponse(response) {
    // Split the response into paragraphs
    const paragraphs = response.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    console.log('Parsed paragraphs:', paragraphs.length);
    
    const sections = {
      introduction: '',
      coreTopic: '',
      whyThisWorks: '',
      whatToExpect: '',
      gettingStarted: ''
    };
    
    // If we have a good amount of content, distribute it across sections
    if (paragraphs.length >= 3) {
      sections.introduction = this.createIntroFromResponse(response);
      sections.coreTopic = paragraphs.slice(0, 2).join(' '); // First 2 paragraphs as core topic
      
      // Look for explanatory content
      sections.whyThisWorks = this.extractExplanation(response);
      sections.whatToExpect = this.extractExpectations(response);
      sections.gettingStarted = this.extractActionSteps(response);
    } else {
      // If it's a short response, use it as core topic and generate appropriate sections
      sections.introduction = this.createIntroFromResponse(response);
      sections.coreTopic = response;
      sections.whyThisWorks = this.getFallbackContent('whyThisWorks');
      sections.whatToExpect = this.getFallbackContent('whatToExpect');
      sections.gettingStarted = this.getFallbackContent('gettingStarted');
    }
    
    return sections;
  }
  
  createIntroFromResponse(response) {
    // Create a personalized intro based on the response content
    const experienceLevel = this.responseData.experienceLevel || 'casual';
    const firstSentence = response.split('.')[0] + '.';
    
    if (experienceLevel === 'new') {
      return `Welcome! I'm here to guide you through your cannabis journey. ${firstSentence}`;
    } else if (experienceLevel === 'experienced') {
      return `Based on your experience level, here's my analysis: ${firstSentence}`;
    } else {
      return `Great question! Let me provide you with personalized guidance. ${firstSentence}`;
    }
  }
  
  extractExplanation(response) {
    // Look for explanatory phrases
    const explanationKeywords = ['because', 'since', 'due to', 'reason', 'mechanism', 'work by'];
    const sentences = response.split('. ');
    
    for (const sentence of sentences) {
      if (explanationKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        return sentence + '.';
      }
    }
    
    return this.getFallbackContent('whyThisWorks');
  }
  
  extractExpectations(response) {
    // Look for expectation-related content
    const expectationKeywords = ['expect', 'feel', 'experience', 'within', 'after', 'minutes', 'hours'];
    const sentences = response.split('. ');
    
    for (const sentence of sentences) {
      if (expectationKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        return sentence + '.';
      }
    }
    
    return this.getFallbackContent('whatToExpect');
  }
  
  extractActionSteps(response) {
    // Look for action-oriented content
    const actionKeywords = ['start', 'begin', 'first', 'try', 'use', 'take', 'dose'];
    const sentences = response.split('. ');
    
    for (const sentence of sentences) {
      if (actionKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        return sentence + '.';
      }
    }
    
    return this.getFallbackContent('gettingStarted');
  }

  populateIntroduction(content) {
    const introText = document.querySelector('.introduction-text');
    if (introText) {
      introText.textContent = content;
    }
  }

  populateCoreTopic(content) {
    const coreTopicText = document.querySelector('.core-topic-text');
    if (coreTopicText) {
      coreTopicText.textContent = content;
    }
  }

  populateWhyThisWorks(content) {
    const whyText = document.querySelector('.why-text');
    if (whyText) {
      whyText.textContent = content;
    }
  }

  populateWhatToExpect(content) {
    const expectText = document.querySelector('.expect-text');
    if (expectText) {
      expectText.textContent = content;
    }
  }

  populateGettingStarted(content) {
    const startedText = document.querySelector('.started-text');
    if (startedText) {
      startedText.textContent = content;
    }
  }

  getFallbackContent(sectionType) {
    const fallbacks = {
      introduction: `Welcome! I'm here to provide you with personalized cannabis guidance based on your ${this.responseData.experienceLevel} experience level.`,
      coreTopic: "Let me provide you with comprehensive cannabis guidance tailored to your specific needs and experience level.",
      whyThisWorks: "This approach is recommended based on your experience level and the scientific principles of cannabis interaction with your body.",
      whatToExpect: "You can expect gradual onset of effects with the recommended approach, allowing you to gauge your response safely.",
      gettingStarted: "Start with the lowest recommended dose and wait to assess effects before considering any adjustments."
    };
    return fallbacks[sectionType] || "Loading personalized guidance...";
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

  // Removed unused methods: populateCannabisScience, makeMoreScientific, populateConsumptionDosing
  // These were for the old section structure that has been replaced with the new MVP flow

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