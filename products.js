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
    
    // Use enhanced content filter to extract structured data for existing UI
    console.log('Extracting structured data for existing UI...');
    this.populateExistingUIElements(aiResponse);
    console.log('UI population complete');
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
      whatToExpected: "You can expect gradual onset of effects with the recommended approach, allowing you to gauge your response safely.",
      gettingStarted: "Start with the lowest recommended dose and wait to assess effects before considering any adjustments."
    };
    return fallbacks[sectionType] || "Loading personalized guidance...";
  }

  // Enhanced content filter that maps AI response to existing UI elements
  populateExistingUIElements(aiResponse) {
    console.log('=== SMART CONTENT FILTERING FOR EXISTING UI ===');
    
    // Extract structured data from AI response
    const extractedData = this.extractStructuredData(aiResponse);
    console.log('Extracted data:', extractedData);
    
    // Populate personalized recommendations section
    this.populateRecommendationDetails(extractedData);
    
    // Populate science explanation
    this.populateScienceSection(extractedData);
    
    // Populate dosing guidelines  
    this.populateDosingGuidelines(extractedData);
    
    // Populate guidance cards
    this.populateGuidanceCards(extractedData);
    
    // Populate product cards with AI-generated content
    this.populateProductCards(extractedData);
  }

  extractStructuredData(response) {
    console.log('Extracting structured data from AI response...');
    
    const data = {
      thcLevel: this.extractTHCInfo(response),
      cbdContent: this.extractCBDInfo(response), 
      bestMatch: this.extractStrainRecommendation(response),
      whyThisWorks: this.extractExplanation(response),
      scientificInsights: this.extractScientificContent(response),
      dosingGuidelines: this.extractDosingInfo(response),
      quickTips: this.extractQuickTips(response),
      preparationSteps: this.extractPreparationSteps(response),
      dispensaryInfo: this.extractDispensaryInfo(response),
      products: this.extractProductRecommendations(response)
    };
    
    return data;
  }

  extractTHCInfo(response) {
    // Look for THC percentage mentions
    const thcPattern = /(\d+(?:\.\d+)?)\s*-?\s*(\d+(?:\.\d+)?)?\s*%?\s*THC/i;
    const match = response.match(thcPattern);
    if (match) {
      return match[2] ? `${match[1]}-${match[2]}% THC` : `${match[1]}% THC`;
    }
    
    // Look for THC level descriptions
    if (response.toLowerCase().includes('low thc') || response.toLowerCase().includes('mild')) {
      return '5-15% THC (Beginner-friendly)';
    }
    if (response.toLowerCase().includes('high thc') || response.toLowerCase().includes('potent')) {
      return '20-25% THC (Experienced users)';
    }
    
    return 'THC levels tailored to your experience';
  }

  extractCBDInfo(response) {
    // Look for CBD percentage mentions
    const cbdPattern = /(\d+(?:\.\d+)?)\s*-?\s*(\d+(?:\.\d+)?)?\s*%?\s*CBD/i;
    const match = response.match(cbdPattern);
    if (match) {
      return match[2] ? `${match[1]}-${match[2]}% CBD` : `${match[1]}% CBD`;
    }
    
    // Look for CBD descriptions
    if (response.toLowerCase().includes('cbd dominant') || response.toLowerCase().includes('high cbd')) {
      return '10-20% CBD (Therapeutic focus)';
    }
    if (response.toLowerCase().includes('balanced') || response.toLowerCase().includes('1:1')) {
      return 'Balanced THC:CBD ratio';
    }
    
    return 'CBD content for wellness benefits';
  }

  extractStrainRecommendation(response) {
    // Look for specific strain mentions
    const strainPattern = /(?:strain|variety|cultivar):\s*([^,.!?\n]+)/i;
    const match = response.match(strainPattern);
    if (match) {
      return match[1].trim();
    }
    
    // Look for indica/sativa/hybrid mentions
    if (response.toLowerCase().includes('indica')) {
      return 'Indica-dominant strains for relaxation';
    }
    if (response.toLowerCase().includes('sativa')) {
      return 'Sativa-dominant strains for energy';
    }
    if (response.toLowerCase().includes('hybrid')) {
      return 'Hybrid strains for balanced effects';
    }
    
    return 'Strains matched to your goals';
  }

  extractScientificContent(response) {
    // Look for scientific explanations
    const sentences = response.split('. ');
    const scientificKeywords = ['cannabinoid', 'terpene', 'receptor', 'endocannabinoid', 'mechanism', 'interact', 'bind'];
    
    for (const sentence of sentences) {
      if (scientificKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        return sentence.trim() + '.';
      }
    }
    
    return 'Cannabis compounds work with your body\'s natural systems to produce therapeutic effects through cannabinoid receptors.';
  }

  extractDosingInfo(response) {
    // Look for dosing guidelines
    const sentences = response.split('. ');
    const dosingKeywords = ['start', 'dose', 'mg', 'low', 'small', 'begin', 'wait', 'hours'];
    
    const dosingSteps = [];
    for (const sentence of sentences) {
      if (dosingKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        dosingSteps.push(sentence.trim());
      }
    }
    
    if (dosingSteps.length > 0) {
      return dosingSteps;
    }
    
    // Default dosing based on experience level
    const experience = this.responseData.experienceLevel;
    if (experience === 'new') {
      return ['Start with 2.5-5mg THC', 'Wait 2-3 hours before additional doses', 'Increase gradually over multiple sessions'];
    } else if (experience === 'casual') {
      return ['Start with 5-10mg THC', 'Wait 1-2 hours to assess effects', 'Adjust based on your tolerance'];
    } else {
      return ['Start with your usual dose', 'Monitor effects and adjust as needed', 'Consider tolerance breaks if needed'];
    }
  }

  extractQuickTips(response) {
    const tips = [];
    const sentences = response.split('. ');
    const tipKeywords = ['tip', 'important', 'remember', 'avoid', 'ensure', 'always'];
    
    for (const sentence of sentences) {
      if (tipKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        tips.push(sentence.trim());
      }
    }
    
    // Add experience-level specific tips
    const experience = this.responseData.experienceLevel;
    if (experience === 'new') {
      tips.push('Start low and go slow');
      tips.push('Have snacks and water ready');
      tips.push('Stay in a comfortable environment');
    } else {
      tips.push('Consider your tolerance level');
      tips.push('Choose quality over quantity');
      tips.push('Track your experiences');
    }
    
    return tips.slice(0, 3); // Limit to 3 tips
  }

  extractPreparationSteps(response) {
    const steps = [];
    const sentences = response.split('. ');
    const prepKeywords = ['prepare', 'before', 'ready', 'set up', 'ensure', 'plan'];
    
    for (const sentence of sentences) {
      if (prepKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        steps.push(sentence.trim());
      }
    }
    
    // Add standard preparation steps
    steps.push('Choose a comfortable, safe environment');
    steps.push('Clear your schedule for 3-4 hours');
    steps.push('Have water and healthy snacks available');
    
    return steps.slice(0, 3);
  }

  extractDispensaryInfo(response) {
    const info = [];
    
    // Look for dispensary-related content
    const sentences = response.split('. ');
    const dispensaryKeywords = ['dispensary', 'budtender', 'licensed', 'shop', 'store'];
    
    for (const sentence of sentences) {
      if (dispensaryKeywords.some(keyword => sentence.toLowerCase().includes(keyword))) {
        info.push(sentence.trim());
      }
    }
    
    // Add standard dispensary guidance
    info.push('Visit licensed dispensaries only');
    info.push('Ask budtenders for product recommendations');
    info.push('Verify lab testing and certificates');
    
    return info.slice(0, 3);
  }

  extractProductRecommendations(response) {
    // Generate product data based on AI response
    const experience = this.responseData.experienceLevel;
    
    const products = [
      {
        name: this.generateProductName(response, 0),
        strain: this.extractStrainRecommendation(response) || 'Hybrid',
        effects: this.extractEffects(response, 0),
        thc: this.extractTHCInfo(response) || this.getDefaultTHC(experience),
        cbd: this.extractCBDInfo(response) || this.getDefaultCBD(experience),
        description: this.generateProductDescription(response, 0),
        whyThisWorks: this.extractPersonalizedReason(response, 0),
        price: '$25-45',
        availability: 'In Stock'
      },
      {
        name: this.generateProductName(response, 1),
        strain: this.getAlternativeStrain(response),
        effects: this.extractEffects(response, 1),
        thc: this.getAlternativeTHC(experience),
        cbd: this.getAlternativeCBD(experience),
        description: this.generateProductDescription(response, 1),
        whyThisWorks: this.extractPersonalizedReason(response, 1),
        price: '$30-50',
        availability: 'In Stock'
      }
    ];
    
    return products;
  }

  // Helper methods for product generation
  generateProductName(response, index) {
    const strainTypes = ['Relaxing', 'Energizing', 'Balanced', 'Therapeutic', 'Premium'];
    const products = ['Flower', 'Edibles', 'Vape', 'Tincture', 'Capsules'];
    
    if (response.toLowerCase().includes('flower') || response.toLowerCase().includes('smoke')) {
      return `${strainTypes[index]} Cannabis Flower`;
    }
    if (response.toLowerCase().includes('edible') || response.toLowerCase().includes('gummy')) {
      return `${strainTypes[index]} Cannabis Edibles`;
    }
    if (response.toLowerCase().includes('vape') || response.toLowerCase().includes('cartridge')) {
      return `${strainTypes[index]} Vape Cartridge`;
    }
    
    return `${strainTypes[index]} ${products[index % products.length]}`;
  }

  extractEffects(response, index) {
    const allEffects = ['Relaxing', 'Energizing', 'Focus', 'Creative', 'Social', 'Sleep', 'Pain Relief', 'Anxiety Relief'];
    
    // Look for effect mentions in response
    const foundEffects = allEffects.filter(effect => 
      response.toLowerCase().includes(effect.toLowerCase())
    );
    
    if (foundEffects.length > 0) {
      return foundEffects[index % foundEffects.length];
    }
    
    return allEffects[index % allEffects.length];
  }

  getDefaultTHC(experience) {
    return {
      'new': '5-10% THC',
      'casual': '15-20% THC', 
      'experienced': '20-25% THC'
    }[experience] || '15% THC';
  }

  getDefaultCBD(experience) {
    return {
      'new': '5-15% CBD',
      'casual': '2-8% CBD',
      'experienced': '<2% CBD'
    }[experience] || '5% CBD';
  }

  getAlternativeStrain(response) {
    if (response.toLowerCase().includes('indica')) {
      return 'Hybrid (Balanced)';
    }
    if (response.toLowerCase().includes('sativa')) {
      return 'Indica (Relaxing)';
    }
    return 'Sativa (Energizing)';
  }

  getAlternativeTHC(experience) {
    return {
      'new': '2.5-7.5% THC',
      'casual': '12-18% THC',
      'experienced': '18-22% THC'
    }[experience] || '12% THC';
  }

  getAlternativeCBD(experience) {
    return {
      'new': '8-20% CBD',
      'casual': '5-12% CBD', 
      'experienced': '1-5% CBD'
    }[experience] || '8% CBD';
  }

  generateProductDescription(response, index) {
    const sentences = response.split('. ').filter(s => s.length > 20);
    if (sentences.length > index) {
      return sentences[index].trim() + '.';
    }
    
    const experience = this.responseData.experienceLevel;
    const defaults = {
      'new': ['Perfect for beginners with gentle, predictable effects.', 'Mild potency designed for comfortable first experiences.'],
      'casual': ['Great balance of effects for regular users.', 'Reliable option that delivers consistent results.'],
      'experienced': ['Premium quality for connoisseurs.', 'Complex profile with nuanced effects.']
    };
    
    return defaults[experience][index] || 'High-quality cannabis product from licensed dispensaries.';
  }

  extractPersonalizedReason(response, index) {
    const sentences = response.split('. ');
    const reasonKeywords = ['because', 'since', 'ideal', 'perfect', 'suitable', 'recommended'];
    
    const reasons = sentences.filter(sentence =>
      reasonKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );
    
    if (reasons.length > index) {
      return reasons[index].trim() + '.';
    }
    
    const experience = this.responseData.experienceLevel;
    const defaults = {
      'new': ['Gentle introduction to cannabis with minimal side effects.', 'Safe starting point to understand your tolerance.'],
      'casual': ['Matches your experience level with reliable effects.', 'Provides the benefits you\'re looking for.'],
      'experienced': ['Sophisticated option that meets your standards.', 'Advanced formulation for discerning users.']
    };
    
    return defaults[experience][index] || 'Carefully selected based on your preferences and experience level.';
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
      this.renderEffectsTags(effectsTags, product.effects);
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

  // Render up to 3 effect tags; append "+N more" if applicable
  renderEffectsTags(container, effects) {
    container.innerHTML = '';
    const list = Array.isArray(effects) ? effects : (effects ? [effects] : []);
    const maxTags = 3;
    list.slice(0, maxTags).forEach(effect => {
      const tag = document.createElement('span');
      tag.className = 'effect-tag';
      tag.textContent = effect;
      container.appendChild(tag);
    });
    const remaining = list.length - maxTags;
    if (remaining > 0) {
      const more = document.createElement('span');
      more.className = 'effect-tag more-tag';
      more.textContent = `+${remaining} more`;
      container.appendChild(more);
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

  // Methods to populate actual UI elements (matching existing HTML structure)
  populateRecommendationDetails(data) {
    console.log('Populating recommendation details...');
    
    // Update section intro
    const sectionIntro = document.querySelector('.section-intro');
    if (sectionIntro) {
      const experience = this.responseData.experienceLevel;
      const intro = `Based on your ${experience} experience level, here are your personalized cannabis recommendations:`;
      sectionIntro.textContent = intro;
    }
    
    // Update THC detail
    const thcDetail = document.querySelector('.thc-detail');
    if (thcDetail) {
      thcDetail.textContent = data.thcLevel;
    }
    
    // Update CBD detail
    const cbdDetail = document.querySelector('.cbd-detail');
    if (cbdDetail) {
      cbdDetail.textContent = data.cbdContent;
    }
    
    // Update best match detail
    const matchDetail = document.querySelector('.match-detail');
    if (matchDetail) {
      matchDetail.textContent = data.bestMatch;
    }
    
    // Update why this works detail
    const whyDetail = document.querySelector('.why-detail');
    if (whyDetail) {
      whyDetail.textContent = data.whyThisWorks;
    }
  }

  populateScienceSection(data) {
    console.log('Populating science section...');
    
    const scienceExplanation = document.querySelector('.science-explanation');
    if (scienceExplanation) {
      scienceExplanation.textContent = data.scientificInsights;
    }
  }

  populateDosingGuidelines(data) {
    console.log('Populating dosing guidelines...');
    
    const dosingList = document.querySelector('.dosing-steps');
    if (dosingList && data.dosingGuidelines) {
      dosingList.innerHTML = '';
      data.dosingGuidelines.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        dosingList.appendChild(li);
      });
    }
  }

  populateGuidanceCards(data) {
    console.log('Populating guidance cards...');
    
    // Populate Quick Tips card
    const quickTipsList = document.querySelector('.quick-tips-card .guidance-list');
    if (quickTipsList && data.quickTips) {
      quickTipsList.innerHTML = '';
      data.quickTips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        quickTipsList.appendChild(li);
      });
    }
    
    // Populate Preparation card
    const prepList = document.querySelector('.preparation-card .guidance-list');
    if (prepList && data.preparationSteps) {
      prepList.innerHTML = '';
      data.preparationSteps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        prepList.appendChild(li);
      });
    }
    
    // Populate Where to Buy card
    const buyList = document.querySelector('.where-to-buy-card .guidance-list');
    if (buyList && data.dispensaryInfo) {
      buyList.innerHTML = '';
      data.dispensaryInfo.forEach(info => {
        const li = document.createElement('li');
        li.textContent = info;
        buyList.appendChild(li);
      });
    }
  }

  populateProductCards(data) {
    console.log('Populating product cards...');
    
    if (!data.products || data.products.length < 2) {
      console.warn('Insufficient product data');
      return;
    }
    
    const productCards = document.querySelectorAll('.enhanced-product-card');
    
    productCards.forEach((card, index) => {
      if (index >= data.products.length) return;
      
      const product = data.products[index];
      console.log(`Populating product ${index}:`, product);
      
      // Update product name
      const productName = card.querySelector('.product-name');
      if (productName) {
        productName.textContent = product.name;
      }
      
      // Update strain name
      const strainName = card.querySelector('.strain-name');
      if (strainName) {
        strainName.textContent = product.strain;
      }
      
      // Update effect tags (limit for readability)
      const effectsTags = card.querySelector('.effects-tags');
      if (effectsTags) {
        this.renderEffectsTags(effectsTags, product.effects);
      }
      
      // Update THC value
      const thcValue = card.querySelector('.thc .potency-value');
      if (thcValue) {
        thcValue.textContent = product.thc;
      }
      
      // Update CBD value
      const cbdValue = card.querySelector('.cbd .potency-value');
      if (cbdValue) {
        cbdValue.textContent = product.cbd;
      }
      
      // Update product description
      const productDescription = card.querySelector('.product-description');
      if (productDescription) {
        productDescription.textContent = product.description;
      }
      
      // Update why this works explanation
      const whyExplanation = card.querySelector('.why-explanation');
      if (whyExplanation) {
        whyExplanation.textContent = product.whyThisWorks;
      }
      
      // Update pricing
      const price = card.querySelector('.price');
      if (price) {
        price.textContent = product.price;
      }
      
      // Update availability
      const availability = card.querySelector('.availability');
      if (availability) {
        availability.textContent = product.availability;
        availability.className = `availability ${product.availability.toLowerCase().replace(' ', '-')}`;
      }
      
      // Update product type badge
      const typeBadge = card.querySelector('.product-type-badge');
      if (typeBadge) {
        if (product.name.toLowerCase().includes('flower')) {
          typeBadge.textContent = 'Flower';
        } else if (product.name.toLowerCase().includes('edible')) {
          typeBadge.textContent = 'Edibles';
        } else if (product.name.toLowerCase().includes('vape')) {
          typeBadge.textContent = 'Vape';
        } else {
          typeBadge.textContent = 'Premium';
        }
      }
    });
  }

}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ProductsPageHandler();
});
