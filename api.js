/**
 * Copyright (c) 2025-2026 One Block Away LLC
 * All rights reserved. Proprietary and confidential.
 */

// Together.ai API Configuration
const API_CONFIG = {
  together: {
    baseUrl: 'https://api.together.xyz/v1/chat/completions',
    timeout: 30000,
    models: {
      // Budget-friendly models (best bang for buck)
      llama32_3b: 'meta-llama/Llama-3.2-3B-Instruct-Turbo',  // $0.06/1M - BEST VALUE
      llama3_8b: 'meta-llama/Llama-3-8B-Instruct-Lite',      // $0.10/1M - GOOD VALUE
      
      // Affordable alternatives  
      mistral_7b: 'mistralai/Mistral-7B-Instruct-v0.1',      // $0.20/1M
      qwen25_7b: 'Qwen/Qwen2.5-7B-Instruct-Turbo',          // $0.30/1M
      
      // Premium models (for comparison)
      llama2_70b: 'meta-llama/Llama-2-70b-chat-hf',         // Higher cost
      mixtral_8x7b: 'mistralai/Mixtral-8x7B-Instruct-v0.1'  // Higher cost
    }
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
    this.preferredModel = 'llama'; // 'llama' or 'mistral'
  }

  // Generate AI response using Together.ai
  async generateResponse(userInput, experienceLevel, useModel = null) {
    try {
      // Check if API key is available
      if (!window.Config || !window.Config.hasApiKey()) {
        throw new Error('Together.ai API key not configured');
      }

      const prompt = this.buildPrompt(userInput, experienceLevel);
      const modelToUse = this.getModel(useModel);
      
      return await this.callTogetherAI(prompt, modelToUse);
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Return fallback response for demo purposes
      return this.getFallbackResponse(userInput, experienceLevel);
    }
  }

  getModel(preferredModel) {
    const models = API_CONFIG.together.models;
    
    if (preferredModel === 'mistral' || this.preferredModel === 'mistral') {
      return models.mistral_7b; // Use budget-friendly Mistral 7B ($0.20/1M)
    } else {
      return models.llama32_3b; // Default to BEST VALUE Llama 3.2 3B ($0.06/1M)
    }
  }

  buildPrompt(userInput, experienceLevel) {
    const experienceContext = {
      new: "The user is new to cannabis and needs gentle, educational guidance with safety as the top priority.",
      casual: "The user has some cannabis experience and is looking to enhance their knowledge and discover new products.",
      experienced: "The user is experienced with cannabis and interested in advanced insights, optimization, and premium products."
    };

    return `You are Sage, a knowledgeable and friendly cannabis educator working with dispensary customers. 

User Experience Level: ${experienceLevel}
Context: ${experienceContext[experienceLevel] || experienceContext.casual}

User Question: "${userInput}"

Please provide a helpful, informative response that:
1. Directly addresses their question in natural, conversational language
2. Considers their experience level
3. Includes specific, actionable advice
4. Maintains a warm, educational tone
5. Prioritizes safety and responsible use

Keep your response focused, practical, and around 2-3 paragraphs.`;
  }

  async callTogetherAI(prompt, model) {
    const apiKey = window.Config.get('TOGETHER_API_KEY');
    
    if (!apiKey) {
      throw new Error('Together.ai API key not found');
    }

    const response = await fetch(API_CONFIG.together.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are Sage, a helpful cannabis education assistant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
        repetition_penalty: 1.1
      }),
      signal: AbortSignal.timeout(API_CONFIG.together.timeout)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Together.ai API error:', response.status, errorText);
      throw new Error(`Together.ai API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from Together.ai');
    }
    
    return data.choices[0].message.content;
  }

  getFallbackResponse(userInput, experienceLevel) {
    const fallbacks = {
      new: "As a cannabis newcomer, I'd recommend starting with low-dose products (2.5-5mg THC) and waiting at least 2 hours between doses to see how you feel. Consider CBD-dominant products for gentler effects, and always purchase from licensed dispensaries. Don't hesitate to ask your budtender for guidance - they're there to help ensure you have a safe, positive experience.",
      
      casual: "Since you have some cannabis experience, you might enjoy exploring different consumption methods like vaping for quicker onset, or trying products with specific terpene profiles. Consider keeping a cannabis journal to track what works best for different situations. Remember that tolerance can change, so it's always good to start lower when trying new products.",
      
      experienced: "For experienced users like yourself, you might be interested in exploring the entourage effect through full-spectrum products, or experimenting with minor cannabinoids like CBG or CBN. Consider rotating strains to prevent tolerance buildup, and look into craft products from premium cultivators for unique terpene profiles and effects."
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

  // Test API connectivity
  async testConnection() {
    try {
      if (!window.Config || !window.Config.hasApiKey()) {
        return { together: false, error: 'API key not configured' };
      }

      // Test with a simple prompt using budget model
      await this.callTogetherAI('Test connection', API_CONFIG.together.models.llama32_3b);
      return { together: true };
    } catch (error) {
      console.warn('Together.ai connection test failed:', error.message);
      return { together: false, error: error.message };
    }
  }

  // Set preferred model
  setPreferredModel(model) {
    if (model === 'llama' || model === 'mistral') {
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