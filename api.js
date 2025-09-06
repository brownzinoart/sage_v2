/**
 * Copyright (c) 2025-2026 One Block Away LLC
 * All rights reserved. Proprietary and confidential.
 */

// Ollama MCP API Configuration
const API_CONFIG = {
  ollama: {
    // Base timeout used as a floor; per-attempt timeouts below may exceed this
    timeout: 120000,
    models: {
      // Primary model for experience-level filtering
      qwen2_5_14b: 'qwen2.5:14b-instruct',     // Best for instruction following
      mistral: 'mistral:latest',                // General purpose backup
      deepseek_coder_16b: 'deepseek-coder-v2:16b', // Coding tasks
      deepseek_coder_33b: 'deepseek-coder:33b',    // Complex coding
      llava: 'llava:latest'                     // Vision tasks
    },
    // Default model for cannabis guidance
    defaultModel: 'qwen2.5:14b-instruct'
  }
};

// Experience-based benefit content
const EXPERIENCE_BENEFITS = {
  new: [
    {
      title: 'Education First',
      points: [
        'Cannabis 101 basics & terminology',
        'Dosing guidelines for beginners',
        'Understanding effects timeline'
      ]
    },
    {
      title: 'Safety & Comfort',
      points: [
        'Start low and go slow approach',
        'What to expect during first use',
        'When and how to seek help'
      ]
    },
    {
      title: 'Guided Selection',
      points: [
        'Beginner-friendly product recommendations',
        'Mild effects with clear labeling',
        'Simple consumption methods'
      ]
    }
  ],
  casual: [
    {
      title: 'Quick Tips',
      points: [
        'Try vaping for faster onset control',
        'Keep a cannabis journal for tracking',
        'Explore different terpene profiles',
        'Rotate strains to prevent tolerance'
      ]
    },
    {
      title: 'Before You Start',
      points: [
        'Check your tolerance level today',
        'Consider your activity plans',
        'Choose the right strain for the occasion',
        'Set intentions for your session'
      ]
    },
    {
      title: 'Where to Buy',
      points: [
        'Green Valley Dispensary - 123 Main St',
        'Mention your experience level for personalized help',
        'Weekly deals on featured products',
        'Join our loyalty program for exclusive discounts'
      ]
    }
  ],
  experienced: [
    {
      title: 'Advanced Insights',
      points: [
        'Terpene profiles and effects',
        'Cannabinoid ratios optimization',
        'Understanding entourage effects'
      ]
    },
    {
      title: 'Optimization',
      points: [
        'Tolerance management strategies',
        'Microdosing techniques',
        'Product stacking methods'
      ]
    },
    {
      title: 'Premium Selection',
      points: [
        'Craft and artisanal products',
        'Limited edition offerings',
        'Connoisseur recommendations'
      ]
    }
  ]
};

class SageAPI {
  constructor() {
    this.preferredModel = API_CONFIG.ollama.defaultModel;
  }

  // Generate AI response using Ollama MCP server
  async generateResponse(userInput, experienceLevel, useModel = null) {
    console.log(`=== GENERATING RESPONSE ===`);
    console.log(`User Input: "${userInput}"`);
    console.log(`Experience Level: ${experienceLevel}`);
    
    try {
      // Check if Ollama connection is available
      if (!window.Config || !window.Config.hasOllamaConnection()) {
        console.error('Ollama connection not available');
        throw new Error('Ollama connection not configured');
      }

      const ollamaHost = window.Config.get('OLLAMA_HOST');
      console.log(`=== CONFIGURATION CHECK ===`);
      console.log(`Ollama host: ${ollamaHost}`);
      console.log(`Is proxy URL (11435): ${ollamaHost.includes('11435')}`);
      console.log(`Is direct URL (11434): ${ollamaHost.includes('11434')}`);

      // EMERGENCY BYPASS: Skip connection test to isolate the issue
      console.log('EMERGENCY MODE: Bypassing connection test');
      console.log('Proceeding directly to main API call...');

      const prompt = this.buildExperienceLevelPrompt(userInput, experienceLevel);
      const modelToUse = useModel || this.preferredModel;
      
      console.log(`Using model: ${modelToUse}`);
      console.log(`Prompt length: ${prompt.length} chars`);
      
      const response = await this.callOllama(prompt, modelToUse);
      console.log(`=== OLLAMA RESPONSE RECEIVED ===`);
      console.log(`Response length: ${response.length} chars`);
      console.log(`Response preview: ${response.substring(0, 200)}...`);
      
      return response;
    } catch (error) {
      console.error('=== ERROR GENERATING RESPONSE ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Stack:', error.stack);
      
      // Return fallback response for demo purposes
      console.warn('Falling back to generic response');
      return this.getFallbackResponse(userInput, experienceLevel);
    }
  }

  // Lightweight background warm-up to load the model into memory sooner
  async warmUp() {
    try {
      if (!window.Config || !window.Config.hasOllamaConnection()) return;
      const ollamaHost = window.Config.get('OLLAMA_HOST');
      const model = API_CONFIG.ollama.defaultModel;
      // Quick probe to avoid wasting time if proxy/server is down
      await (async () => {
        if (typeof AbortController === 'undefined') return;
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 3000);
        try {
          await fetch(`${ollamaHost}/api/tags`, { signal: controller.signal });
        } finally {
          clearTimeout(t);
        }
      })().catch(() => { throw new Error('Probe failed'); });
      const requestBody = {
        model,
        prompt: 'Respond with exactly: WARMUP',
        stream: false,
        options: { temperature: 0.0 }
      };

      const url = `${ollamaHost}/api/generate`;
      if (typeof AbortController !== 'undefined') {
        const controller = new AbortController();
        const timeoutMs = 6000; // best-effort: 6s
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });
        } finally {
          clearTimeout(timer);
        }
      } else {
        // Fallback without abort
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
      }
    } catch (_) {
      // Silent failure: warm-up is opportunistic
    }
  }

  getModel(preferredModel) {
    const models = API_CONFIG.ollama.models;
    
    if (preferredModel && models[preferredModel]) {
      return models[preferredModel];
    }
    
    // Default to qwen2.5:14b-instruct for cannabis guidance
    return API_CONFIG.ollama.defaultModel;
  }

  buildExperienceLevelPrompt(userInput, experienceLevel) {
    const experienceInstructions = {
      new: {
        tone: "gentle, educational, safety-first",
        language: "simple terms, avoid jargon, use analogies",
        depth: "basic concepts, step-by-step guidance, emphasis on starting small",
        approach: "reassuring, warm, thorough explanations of what to expect"
      },
      casual: {
        tone: "friendly expert, balanced and practical",
        language: "mix of simple and technical terms, relatable examples", 
        depth: "moderate detail, practical focus, some scientific backing",
        approach: "informative, engaging, build on existing knowledge"
      },
      experienced: {
        tone: "authoritative, comprehensive, efficient",
        language: "technical terminology, precise scientific language",
        depth: "detailed cannabinoid profiles, complex interactions, multiple perspectives (science/exploration/quality)",
        approach: "dense information, nuanced recommendations, advanced concepts"
      }
    };
    
    const instruction = experienceInstructions[experienceLevel] || experienceInstructions.casual;
    
    return `You are THE definitive cannabis expert and authority. A user with ${experienceLevel} experience asks: "${userInput}"

User Experience Level: ${experienceLevel.toUpperCase()}

Adapt your response with these characteristics:
- Tone: ${instruction.tone}
- Language: ${instruction.language}
- Information Depth: ${instruction.depth}
- Approach: ${instruction.approach}

CRITICAL: Structure your response in exactly these 5 sections using these markers:

[INTRODUCTION]
Brief personalized greeting and acknowledgment of their question, adapted to their experience level.

[CORE_TOPIC]
Comprehensive exploration of their question/topic. This is your main educational content with depth matching their experience level.

[WHY_THIS_WORKS]
Explain the scientific/practical reasoning behind your recommendations, adapted to their knowledge level.

[WHAT_TO_EXPECT]
Specific outcomes, timelines, and effects they should expect, with complexity matching their experience.

[GETTING_STARTED]
Concrete action steps and implementation guidance, tailored to their experience level.

Each section should be 2-4 sentences and provide authoritative, clinical-grade guidance. Be specific about strains, dosages, and mechanisms. Write with confidence - no hedging or uncertainty.`;
  }

  async callOllama(prompt, model) {
    const ollamaHost = window.Config.get('OLLAMA_HOST');
    
    console.log(`=== CALLING OLLAMA API ===`);
    console.log(`Host: ${ollamaHost}`);
    console.log(`Model: ${model}`);
    console.log(`🚨 CRITICAL: callOllama method is being executed! 🚨`);
    
    if (!ollamaHost) {
      throw new Error('Ollama host not found');
    }

    const requestBody = {
      model: model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        top_k: 40,
        repeat_penalty: 1.1
      }
    };

    console.log('Request body:', {
      model: requestBody.model,
      promptLength: requestBody.prompt.length,
      stream: requestBody.stream,
      options: requestBody.options
    });

    // Retry with progressive timeouts to handle cold starts and heavy prompts
    const attemptTimeouts = [60000, 120000, 240000]; // 1 min, 2 min, 4 min
    const maxAttempts = attemptTimeouts.length;

    const doFetchWithTimeout = async (timeoutMs) => {
      // Prefer AbortController for true cancellation; fall back to Promise.race if unavailable
      const url = `${ollamaHost}/api/generate`;
      if (typeof AbortController !== 'undefined') {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });
          clearTimeout(timer);
          return response;
        } catch (err) {
          clearTimeout(timer);
          throw err;
        }
      } else {
        // Legacy fallback
        const fetchPromise = fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
        });
        return Promise.race([fetchPromise, timeoutPromise]);
      }
    };

    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const timeoutMs = attemptTimeouts[attempt - 1];
      try {
        console.log(`🚨 Attempt ${attempt}/${maxAttempts} → ${ollamaHost}/api/generate (timeout ${Math.round(timeoutMs/1000)}s)`);
        const response = await doFetchWithTimeout(timeoutMs);
        console.log(`🚨 FETCH COMPLETED (attempt ${attempt}) WITH STATUS: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Ollama API error response:', errorText);
          throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Raw response data:', data);
        if (!data.response) {
          console.error('Missing response field in data:', data);
          throw new Error('Invalid response format from Ollama - missing response field');
        }

        console.log(`=== OLLAMA SUCCESS (attempt ${attempt}) ===`);
        console.log(`Response length: ${data.response.length}`);
        return data.response;
      } catch (fetchError) {
        lastError = fetchError;
        console.error(`=== FETCH ERROR (attempt ${attempt}) ===`);
        console.error('Fetch error:', fetchError);

        const isAbort = fetchError?.name === 'AbortError' || /timeout/i.test(fetchError?.message || '');
        const isNetwork = fetchError?.name === 'TypeError' && /fetch|Failed to fetch/i.test(fetchError?.message || '');

        // For abort/timeout or transient network errors, backoff and retry
        if ((isAbort || isNetwork) && attempt < maxAttempts) {
          const backoff = 1000 * attempt; // 1s, 2s
          console.warn(`Transient error (${isAbort ? 'timeout' : 'network'}). Retrying after ${backoff}ms...`);
          await new Promise(r => setTimeout(r, backoff));
          continue;
        }

        // Non-retryable or final attempt: map to friendly errors
        if (fetchError.name === 'AbortError') {
          throw new Error(`Ollama request timed out after ${Math.round(attemptTimeouts.slice(0, attempt).reduce((a,b)=>a+b,0)/1000)}s`);
        } else if (fetchError.name === 'TypeError') {
          if (fetchError.message.includes('CORS') || fetchError.message.includes('cross-origin')) {
            throw new Error('CORS error - browser blocking cross-origin request to Ollama server');
          } else if (fetchError.message.includes('fetch') || fetchError.message.includes('Failed to fetch')) {
            throw new Error('Cannot connect to Ollama server - check if it is running or CORS is blocking the request');
          } else {
            throw new Error(`Network error: ${fetchError.message}`);
          }
        } else {
          throw fetchError;
        }
      }
    }

    // Should not reach here; throw the last captured error as a safeguard
    throw lastError || new Error('Unknown error contacting Ollama');
  }

  getFallbackResponse(userInput, experienceLevel) {
    // Note: This fallback is only used when Ollama is unavailable
    console.warn('Using fallback response - Ollama server may be offline');
    
    const fallbacks = {
      new: "Your question requires personalized cannabis guidance. Our AI system analyzes your needs to recommend specific products with precise dosing. Start with CBD-dominant options (2.5-5mg THC max) from licensed dispensaries. Our full guidance system provides detailed strain recommendations, safety protocols, and consumption methods tailored to beginners.",
      
      casual: "Your cannabis query needs our full recommendation engine for accurate guidance. Our system provides strain-specific recommendations, terpene profiles, and consumption timing based on your experience level. For immediate help: try indica-dominant hybrids for relaxation, sativa for energy, and always start with lower doses when trying new products.",
      
      experienced: "Your advanced cannabis query requires our comprehensive analysis system. Our platform provides detailed cannabinoid profiles, terpene interactions, minor cannabinoid recommendations (CBG, CBN, THCV), and craft cultivar suggestions. Full system access gives you precise dosing calculations, tolerance management strategies, and premium product selections."
    };

    return fallbacks[experienceLevel] || fallbacks.casual;
  }

  // Get experience-based benefits
  getBenefitsForExperience(experienceLevel) {
    return EXPERIENCE_BENEFITS[experienceLevel] || EXPERIENCE_BENEFITS.casual;
  }

  // Mock product recommendations (replace with real dispensary API)
  async getProductRecommendations(userInput, experienceLevel) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Enhanced mock recommendations based on experience level
    const mockProducts = {
      new: [
        {
          name: 'Gentle Green CBD Tincture',
          type: 'CBD Dominant Tincture',
          thc: '2.5mg',
          cbd: '25mg',
          price: '$35',
          description: 'Perfect for beginners - mild, controlled dosing with calming effects'
        },
        {
          name: 'First Timer Gummies',
          type: 'Hybrid Edible',
          thc: '2.5mg',
          cbd: '2.5mg',
          price: '$20',
          description: 'Low-dose, balanced effect for new users - start with half'
        }
      ],
      casual: [
        {
          name: 'Blue Dream Vape Cart',
          type: 'Hybrid Vaporizer',
          thc: '78%',
          cbd: '1%',
          price: '$45',
          description: 'Popular balanced high - creative and relaxed without couch-lock'
        },
        {
          name: 'Social Blend Gummies',
          type: 'Sativa Edible',
          thc: '5mg',
          cbd: '2mg',
          price: '$25',
          description: 'Perfect for social gatherings and daytime activities'
        }
      ],
      experienced: [
        {
          name: 'Zkittlez Live Rosin',
          type: 'Hybrid Concentrate',
          thc: '82%',
          cbd: '0.5%',
          price: '$80',
          description: 'Premium solventless extract with full terpene preservation'
        },
        {
          name: 'High-Dose RSO Capsules',
          type: 'Indica Edible',
          thc: '50mg',
          cbd: '10mg',
          price: '$60',
          description: 'Medical-grade potency for experienced users seeking strong effects'
        }
      ]
    };

    return mockProducts[experienceLevel] || mockProducts.casual;
  }

  // Test Ollama connectivity
  async testConnection() {
    console.log(`=== TESTING OLLAMA CONNECTION ===`);
    
    try {
      if (!window.Config || !window.Config.hasOllamaConnection()) {
        const error = 'Ollama connection not configured';
        console.error(error);
        return { ollama: false, error };
      }

      const ollamaHost = window.Config.get('OLLAMA_HOST');
      console.log(`Testing connection to: ${ollamaHost}`);

      // Test with a simple prompt using default model
      const testPrompt = 'Respond with exactly: CONNECTION TEST SUCCESSFUL';
      const model = API_CONFIG.ollama.defaultModel;
      console.log(`Using test model: ${model}`);
      
      const response = await this.callOllama(testPrompt, model);
      console.log(`Test response received: ${response.substring(0, 100)}...`);
      
      const success = { ollama: true, response: response.substring(0, 100) };
      console.log('=== CONNECTION TEST PASSED ===');
      return success;
    } catch (error) {
      console.error('=== CONNECTION TEST FAILED ===');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      return { ollama: false, error: error.message };
    }
  }

  // Set preferred model
  setPreferredModel(model) {
    const availableModels = Object.values(API_CONFIG.ollama.models);
    if (availableModels.includes(model)) {
      this.preferredModel = model;
    }
  }

  // Get rich demo data based on experience level
  getDemoData(experienceLevel) {
    const demoResponses = {
      new: {
        personalizedRecommendations: {
          intro: "Hey there! I've handpicked these gentle strains perfect for your cannabis journey. Think of this as your starter pack - designed to give you a smooth, comfortable experience.",
          thcLevel: "1-5mg (beginner-friendly)",
          cbdContent: "Positive levels for balance",
          bestMatch: "Indica-dominant hybrids",
          whyTheseWork: "Mild effects, promote relaxation, no overwhelming psychoactive experience"
        },
        cannabisScience: "For sleep difficulties, Indica strains are ideal. Indica's high myrcene terpene content promotes relaxation and sleep. Expect onset in 15-30 minutes (faster with vaping or concentrates) lasting 2-4 hours.",
        consumptionDosing: [
          "Start Low: 1-2 small puffs for flower products",
          "Go Slow: Wait 15-30 minutes between doses", 
          "Understand Your Tolerance: Pay attention to how you feel",
          "Avoid Overconsumption: Less is more when starting out"
        ],
        benefits: [
          {
            title: 'Quick Tips',
            points: [
              'Start with CBD products for your first try',
              'Choose daytime for your first experience',
              'Have a trusted friend present',
              'Keep water and snacks nearby'
            ]
          },
          {
            title: 'Before You Start',
            points: [
              'Clear your schedule for 4-6 hours',
              'Eat a light meal beforehand',
              'Put your phone on silent',
              'Prepare a comfortable, safe space'
            ]
          },
          {
            title: 'Where to Buy',
            points: [
              'Green Valley Dispensary - 123 Main St',
              'Ask for these products by name',
              'New customer? Get 15% off first visit',
              'Free consultation with licensed budtenders'
            ]
          }
        ],
        products: [
          {
            name: 'Gentle Start CBD Tincture',
            type: 'CBD Dominant Tincture',
            thc: '1mg',
            cbd: '10mg',
            price: '$28',
            description: 'Perfect first cannabis product - mild, predictable effects',
            rating: 4.8,
            availability: 'In Stock',
            strain: 'CBD Rich Hemp',
            effects: ['Relaxation', 'Calm', 'Focus'],
            dispensaryUrl: 'https://dispensary.com/products/gentle-start-cbd-tincture',
            whyThisWorks: 'This CBD-dominant option provides a gentle, approachable way to experience cannabis benefits with consistent, reliable effects perfect for beginners.'
          },
          {
            name: 'Beginner Balance Gummies',
            type: 'Balanced Edible',
            thc: '2.5mg',
            cbd: '2.5mg',
            price: '$18',
            description: 'Low-dose, perfectly balanced for cannabis newcomers',
            rating: 4.9,
            availability: 'In Stock',
            strain: 'Balanced Hybrid',
            effects: ['Mild Euphoria', 'Relaxation', 'Happy'],
            dispensaryUrl: 'https://dispensary.com/products/beginner-balance-gummies',
            whyThisWorks: 'The balanced THC:CBD ratio ensures a mild, comfortable introduction to cannabis with manageable effects and easy dosing control.'
          }
        ]
      },
      casual: {
        personalizedRecommendations: {
          intro: "Since you have some cannabis experience, you might enjoy exploring different consumption methods like vaping for quicker onset, or trying products with specific terpene profiles.",
          thcLevel: "5-15mg (comfortable range)",
          cbdContent: "Balanced ratios for enhanced effects",
          bestMatch: "Balanced hybrids or strain-specific selections",
          whyTheseWork: "Enhanced effects, strain-specific benefits, expanded experience range"
        },
        cannabisScience: "We recommend trying an Indica-dominant hybrid with 18-22% THC from Verano Reserve or The Essence. These offer a balanced relaxation without being overwhelmingly sedating. Consider a pre-roll for convenience or a tincture for precise dosing.",
        consumptionDosing: [
          "Start with a low dose (e.g., half a pre-roll or 5mg of a gummy)",
          "Vaping offers faster onset for quicker relief", 
          "Consume 1-2 hours before bedtime",
          "Keep a cannabis journal to track effectiveness"
        ],
        benefits: [
          {
            title: 'Quick Tips',
            points: [
              'Try vaping for faster onset control',
              'Keep a cannabis journal for tracking',
              'Explore different terpene profiles',
              'Rotate strains to prevent tolerance'
            ]
          },
          {
            title: 'Before You Start',
            points: [
              'Check your tolerance level today',
              'Consider your activity plans',
              'Choose the right strain for the occasion',
              'Set intentions for your session'
            ]
          },
          {
            title: 'Where to Buy',
            points: [
              'Green Valley Dispensary - 123 Main St',
              'Mention your experience level for personalized help',
              'Weekly deals on featured products',
              'Join our loyalty program for exclusive discounts'
            ]
          }
        ],
        products: [
          {
            name: 'Blue Dream Vape Cart',
            type: 'Hybrid Vaporizer',
            thc: '82%',
            cbd: '0.8%',
            price: '$48',
            description: 'Classic balanced hybrid - perfect for any time of day',
            rating: 4.7,
            availability: 'In Stock',
            strain: 'Blue Dream',
            effects: ['Creative', 'Euphoric', 'Relaxed', 'Happy'],
            dispensaryUrl: 'https://dispensary.com/products/blue-dream-vape-cart',
            whyThisWorks: 'This legendary hybrid offers the perfect balance of mental clarity and physical relaxation, ideal for your experience level and versatile for any occasion.'
          },
          {
            name: 'Social Hour Gummies',
            type: 'Sativa Edible',
            thc: '5mg',
            cbd: '1mg',
            price: '$32',
            description: 'Perfectly dosed for social situations and good vibes',
            rating: 4.6,
            availability: 'Limited Stock',
            strain: 'Green Crack',
            effects: ['Energetic', 'Social', 'Uplifting', 'Focus'],
            dispensaryUrl: 'https://dispensary.com/products/social-hour-gummies',
            whyThisWorks: 'The moderate 5mg dose provides the perfect social enhancement without overwhelming effects, keeping you engaged and comfortable in group settings.'
          }
        ]
      },
      experienced: {
        personalizedRecommendations: {
          intro: "Welcome, cannabis connoisseur! I've selected premium options that match your sophisticated palate and knowledge of cannabinoid profiles.",
          thcLevel: "20-35% (high-potency selections)",
          cbdContent: "Minor cannabinoid enhanced (CBG, CBN, THCV)",
          bestMatch: "Full-spectrum concentrates and craft cultivars",
          whyTheseWork: "Complex terpene profiles, entourage effects, precision dosing capabilities"
        },
        cannabisScience: "For advanced users like yourself, consider exploring the entourage effect through full-spectrum products, or experimenting with minor cannabinoids like CBG or CBN. These compounds work synergistically for enhanced therapeutic benefits tailored to your specific needs.",
        consumptionDosing: [
          "Precision dosing with concentrates or tinctures",
          "Rotate strains to prevent tolerance buildup", 
          "Consider microdosing for sustained benefits",
          "Time consumption with circadian rhythms for optimal effects"
        ],
        benefits: [
          {
            title: 'Quick Tips',
            points: [
              'Focus on minor cannabinoids today',
              'Try combining different consumption methods',
              'Consider full-spectrum over isolates',
              'Time doses with your circadian rhythm'
            ]
          },
          {
            title: 'Before You Start',
            points: [
              'Review your tolerance patterns',
              'Check your cannabinoid preferences',
              'Plan your microdosing schedule',
              'Prepare for advanced extraction methods'
            ]
          },
          {
            title: 'Where to Buy',
            points: [
              'Green Valley Dispensary - 123 Main St',
              'Ask about our Premium Collection',
              'Reserve rare products with advance notice',
              'VIP access to limited edition drops'
            ]
          }
        ],
        products: [
          {
            name: 'Zkittlez Live Rosin',
            type: 'Hybrid Concentrate',
            thc: '78%',
            cbd: '0.3%',
            price: '$85',
            description: 'Artisan solventless extract preserving full terpene spectrum',
            rating: 4.9,
            availability: 'Limited Edition',
            strain: 'Zkittlez',
            effects: ['Euphoric', 'Creative', 'Relaxed', 'Flavorful'],
            dispensaryUrl: 'https://dispensary.com/products/zkittlez-live-rosin',
            whyThisWorks: 'As an experienced user, you appreciate the complexity of full-spectrum concentrates and the pure, solventless extraction process that preserves maximum terpene profiles.'
          },
          {
            name: 'CBN Night Capsules',
            type: 'Indica Edible',
            thc: '10mg',
            cbd: '5mg',
            price: '$65',
            description: 'Precisely formulated with CBN for optimal sleep support',
            rating: 4.8,
            availability: 'In Stock',
            strain: 'Granddaddy Purple',
            effects: ['Sleepy', 'Relaxed', 'Pain Relief', 'Deep Rest'],
            dispensaryUrl: 'https://dispensary.com/products/cbn-night-capsules',
            whyThisWorks: 'Your advanced understanding of cannabinoids means you can appreciate the precise CBN formulation designed for targeted sleep enhancement and recovery.'
          }
        ]
      }
    };

    return demoResponses[experienceLevel] || demoResponses.casual;
  }
}

// Make SageAPI available globally for browser use
window.SageAPI = SageAPI;
