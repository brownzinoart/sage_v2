/**
 * Copyright (c) 2025-2026 One Block Away LLC
 * All rights reserved. Proprietary and confidential.
 * 
 * Analytics Service - Generates realistic mock data for dispensary dashboard
 */

class SageAnalyticsService {
  constructor() {
    this.baseMetrics = {
      revenue: {
        today: 2847,
        week: 18293,
        month: 74829,
        trend: 0.125 // 12.5% growth
      },
      users: {
        active: 342,
        new: 23,
        returning: 319,
        totalSessions: 1247
      },
      conversion: {
        rate: 0.23, // 23%
        clicks: 935,
        purchases: 287,
        trend: 0.023
      },
      aov: {
        current: 67.50,
        trend: 0.00 // neutral
      }
    };

    this.productCatalog = [
      { id: 1, name: 'Blue Dream', strain: 'Hybrid', thc: '18-22%', category: 'Flower' },
      { id: 2, name: 'Girl Scout Cookies', strain: 'Hybrid', thc: '19-28%', category: 'Flower' },
      { id: 3, name: 'OG Kush', strain: 'Hybrid', thc: '20-25%', category: 'Flower' },
      { id: 4, name: 'White Widow', strain: 'Hybrid', thc: '18-25%', category: 'Flower' },
      { id: 5, name: 'Granddaddy Purple', strain: 'Indica', thc: '17-27%', category: 'Flower' },
      { id: 6, name: 'Sour Diesel', strain: 'Sativa', thc: '20-25%', category: 'Flower' },
      { id: 7, name: 'Green Crack', strain: 'Sativa', thc: '15-20%', category: 'Flower' },
      { id: 8, name: 'Northern Lights', strain: 'Indica', thc: '16-21%', category: 'Flower' },
      { id: 9, name: '10mg THC Gummies', strain: 'Hybrid', thc: '10mg', category: 'Edible' },
      { id: 10, name: '5mg CBD Gummies', strain: 'CBD', thc: '<0.3%', category: 'Edible' },
      { id: 11, name: 'Vape Cartridge - Hybrid', strain: 'Hybrid', thc: '85-90%', category: 'Vape' },
      { id: 12, name: 'CBD Tincture', strain: 'CBD', thc: '<0.3%', category: 'Tincture' }
    ];

    this.queryCategories = [
      'Sleep & Anxiety', 'Pain Relief', 'Focus & Energy', 'Social & Recreation', 
      'First Time Use', 'Medical Consultation', 'Product Education', 'Dosing Guidance'
    ];

    this.experienceLevels = ['New', 'Casual', 'Experienced'];

    // Initialize with some base data
    this.activityFeed = [];
    this.revenueHistory = this.generateRevenueHistory();
    this.productPerformance = this.generateProductPerformance();
    
    this.startRealTimeSimulation();
  }

  // Generate realistic revenue history
  generateRevenueHistory() {
    const history = [];
    const now = new Date();
    
    // Generate 30 days of data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Base revenue with weekend spikes and random variation
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      let baseRevenue = isWeekend ? 3200 : 2400;
      
      // Add some seasonal variation and growth trend
      const seasonalMultiplier = 0.8 + Math.sin((i / 30) * Math.PI) * 0.3;
      const growthMultiplier = 1 + (0.125 / 30) * (30 - i); // 12.5% monthly growth
      const randomVariation = 0.7 + Math.random() * 0.6; // ±30% variation
      
      const revenue = Math.round(baseRevenue * seasonalMultiplier * growthMultiplier * randomVariation);
      const sageRevenue = Math.round(revenue * (0.15 + Math.random() * 0.1)); // 15-25% from Sage
      
      history.push({
        date: date.toISOString().split('T')[0],
        totalRevenue: revenue,
        sageRevenue: sageRevenue,
        directRevenue: revenue - sageRevenue,
        transactions: Math.round(sageRevenue / 67.5), // Based on AOV
        users: Math.round((sageRevenue / 67.5) * 1.3) // Some users don't convert
      });
    }
    
    return history;
  }

  // Generate product performance data
  generateProductPerformance() {
    return this.productCatalog.map(product => {
      // Different products have different popularity
      const popularityFactors = {
        'Blue Dream': 1.5,
        'Girl Scout Cookies': 1.3,
        'OG Kush': 1.2,
        'Granddaddy Purple': 0.9,
        '10mg THC Gummies': 1.4,
        '5mg CBD Gummies': 0.8
      };
      
      const popularityFactor = popularityFactors[product.name] || 1.0;
      const baseClicks = Math.round((50 + Math.random() * 100) * popularityFactor);
      const conversionRate = 0.15 + Math.random() * 0.15; // 15-30% conversion
      const conversions = Math.round(baseClicks * conversionRate);
      
      // Price varies by category
      const priceRanges = {
        'Flower': [25, 45],
        'Edible': [15, 35],
        'Vape': [35, 65],
        'Tincture': [20, 50]
      };
      
      const [minPrice, maxPrice] = priceRanges[product.category];
      const avgPrice = minPrice + Math.random() * (maxPrice - minPrice);
      const revenue = conversions * avgPrice;
      
      return {
        ...product,
        clicks: baseClicks,
        conversions: conversions,
        conversionRate: conversionRate,
        revenue: Math.round(revenue),
        avgPrice: Math.round(avgPrice * 100) / 100,
        inventory: Math.round(20 + Math.random() * 80), // 20-100 items
        trend: -0.1 + Math.random() * 0.2 // -10% to +10%
      };
    });
  }

  // Generate realistic activity events
  generateActivityEvent() {
    const eventTypes = [
      { type: 'query', weight: 40 },
      { type: 'product_view', weight: 30 },
      { type: 'add_to_cart', weight: 15 },
      { type: 'purchase', weight: 10 },
      { type: 'recommendation', weight: 5 }
    ];

    // Weighted random selection
    const totalWeight = eventTypes.reduce((sum, type) => sum + type.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedType = eventTypes[0];
    
    for (const type of eventTypes) {
      random -= type.weight;
      if (random <= 0) {
        selectedType = type;
        break;
      }
    }

    const userId = `user_${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date();
    const experienceLevel = this.experienceLevels[Math.floor(Math.random() * this.experienceLevels.length)];
    
    let event = {
      id: `evt_${timestamp.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      userId,
      experienceLevel,
      type: selectedType.type
    };

    switch (selectedType.type) {
      case 'query':
        const category = this.queryCategories[Math.floor(Math.random() * this.queryCategories.length)];
        const queries = this.getQueriesForCategory(category);
        event.query = queries[Math.floor(Math.random() * queries.length)];
        event.category = category;
        break;
        
      case 'product_view':
        const product = this.productCatalog[Math.floor(Math.random() * this.productCatalog.length)];
        event.product = product;
        break;
        
      case 'add_to_cart':
        const cartProduct = this.productCatalog[Math.floor(Math.random() * this.productCatalog.length)];
        event.product = cartProduct;
        event.quantity = Math.floor(Math.random() * 3) + 1;
        break;
        
      case 'purchase':
        const purchaseProduct = this.productCatalog[Math.floor(Math.random() * this.productCatalog.length)];
        const performance = this.productPerformance.find(p => p.id === purchaseProduct.id);
        event.product = purchaseProduct;
        event.amount = performance ? performance.avgPrice : 50;
        event.quantity = Math.floor(Math.random() * 2) + 1;
        event.totalAmount = event.amount * event.quantity;
        break;
        
      case 'recommendation':
        const recProduct = this.productCatalog[Math.floor(Math.random() * this.productCatalog.length)];
        event.product = recProduct;
        event.confidence = 0.7 + Math.random() * 0.3; // 70-100% confidence
        break;
    }

    return event;
  }

  getQueriesForCategory(category) {
    const queriesByCategory = {
      'Sleep & Anxiety': [
        'I have trouble sleeping, what can help?',
        'Something for anxiety that won\'t make me too high',
        'Best strain for relaxation after work',
        'Having panic attacks, need something gentle'
      ],
      'Pain Relief': [
        'Chronic back pain, looking for relief',
        'Arthritis in my hands, what helps?',
        'Post-workout muscle soreness',
        'Migraines - need something that works'
      ],
      'Focus & Energy': [
        'Need to be productive but relaxed',
        'Something energizing for creative work',
        'ADHD-friendly options that help focus',
        'Daytime use without drowsiness'
      ],
      'Social & Recreation': [
        'Party tonight, what\'s good for socializing?',
        'Movie night with friends',
        'Concert this weekend, want to enhance the experience',
        'Date night - something that relaxes but keeps me alert'
      ],
      'First Time Use': [
        'Never tried cannabis, where do I start?',
        'Scared of getting too high',
        'What\'s the difference between indica and sativa?',
        'How much should I take as a beginner?'
      ],
      'Medical Consultation': [
        'Doctor recommended medical marijuana',
        'Cancer treatment side effects',
        'PTSD and sleep issues',
        'Epilepsy - looking for CBD options'
      ],
      'Product Education': [
        'What are terpenes?',
        'Difference between THC and CBD',
        'How do edibles work differently than smoking?',
        'What are concentrates?'
      ],
      'Dosing Guidance': [
        'How much is too much?',
        'Edibles kicked in too late, took more',
        'Building tolerance, need guidance',
        'Microdosing for daily use'
      ]
    };
    
    return queriesByCategory[category] || ['General cannabis question'];
  }

  // Start real-time activity simulation
  startRealTimeSimulation() {
    // Generate new activity every 3-10 seconds
    setInterval(() => {
      const event = this.generateActivityEvent();
      this.activityFeed.unshift(event); // Add to beginning
      
      // Keep only last 50 events
      if (this.activityFeed.length > 50) {
        this.activityFeed = this.activityFeed.slice(0, 50);
      }
      
      // Dispatch event for real-time updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sage-analytics-update', {
          detail: { type: 'new-activity', event }
        }));
      }
    }, 3000 + Math.random() * 7000);

    // Update metrics periodically
    setInterval(() => {
      this.updateMetrics();
    }, 30000); // Every 30 seconds
  }

  updateMetrics() {
    // Simulate small changes in metrics
    const revenueChange = -50 + Math.random() * 100; // ±$50
    this.baseMetrics.revenue.today = Math.max(0, this.baseMetrics.revenue.today + revenueChange);
    
    const userChange = Math.floor(-2 + Math.random() * 5); // -2 to +3 users
    this.baseMetrics.users.active = Math.max(0, this.baseMetrics.users.active + userChange);
    
    // Small conversion rate fluctuations
    const conversionChange = -0.005 + Math.random() * 0.01; // ±0.5%
    this.baseMetrics.conversion.rate = Math.max(0.05, 
      Math.min(0.5, this.baseMetrics.conversion.rate + conversionChange)
    );

    // Dispatch metrics update event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sage-analytics-update', {
        detail: { type: 'metrics-update', metrics: this.getMetrics() }
      }));
    }
  }

  // Public API methods
  getMetrics(timeRange = 'today') {
    const metrics = { ...this.baseMetrics };
    
    // Adjust metrics based on time range
    switch (timeRange) {
      case 'week':
        metrics.revenue.current = metrics.revenue.week;
        metrics.users.active = Math.round(metrics.users.active * 7.2);
        break;
      case 'month':
        metrics.revenue.current = metrics.revenue.month;
        metrics.users.active = Math.round(metrics.users.active * 28.5);
        break;
      default:
        metrics.revenue.current = metrics.revenue.today;
    }
    
    return metrics;
  }

  getActivityFeed(limit = 10) {
    return this.activityFeed.slice(0, limit);
  }

  getRevenueHistory(days = 30) {
    return this.revenueHistory.slice(-days);
  }

  getProductPerformance(sortBy = 'revenue', limit = 10) {
    const sorted = [...this.productPerformance].sort((a, b) => b[sortBy] - a[sortBy]);
    return sorted.slice(0, limit);
  }

  getExperienceDistribution() {
    // Simulate realistic distribution
    return {
      'New': Math.round(this.baseMetrics.users.active * 0.25),
      'Casual': Math.round(this.baseMetrics.users.active * 0.55),
      'Experienced': Math.round(this.baseMetrics.users.active * 0.20)
    };
  }

  getCategoryDistribution() {
    const total = this.baseMetrics.users.totalSessions;
    return {
      'Sleep & Anxiety': Math.round(total * 0.28),
      'Pain Relief': Math.round(total * 0.22),
      'Focus & Energy': Math.round(total * 0.15),
      'Social & Recreation': Math.round(total * 0.12),
      'First Time Use': Math.round(total * 0.10),
      'Medical Consultation': Math.round(total * 0.08),
      'Product Education': Math.round(total * 0.03),
      'Dosing Guidance': Math.round(total * 0.02)
    };
  }

  getPeakHours() {
    // Generate realistic hourly usage pattern
    const hours = [];
    for (let hour = 0; hour < 24; hour++) {
      let intensity;
      
      if (hour >= 9 && hour <= 11) intensity = 0.6 + Math.random() * 0.3; // Morning peak
      else if (hour >= 17 && hour <= 21) intensity = 0.8 + Math.random() * 0.2; // Evening peak
      else if (hour >= 14 && hour <= 16) intensity = 0.4 + Math.random() * 0.3; // Afternoon
      else if (hour >= 22 || hour <= 1) intensity = 0.3 + Math.random() * 0.4; // Late night
      else intensity = 0.1 + Math.random() * 0.2; // Low activity
      
      hours.push({
        hour,
        intensity: Math.min(1, intensity),
        queries: Math.round(intensity * 80),
        conversions: Math.round(intensity * 15)
      });
    }
    return hours;
  }

  getConversionFunnel() {
    const baseQueries = this.baseMetrics.users.totalSessions;
    return {
      queries: baseQueries,
      productViews: Math.round(baseQueries * 0.75),
      addToCart: Math.round(baseQueries * 0.45),
      purchases: Math.round(baseQueries * 0.23)
    };
  }

  // Simulate sale event for celebration animation
  triggerSaleEvent() {
    const product = this.productCatalog[Math.floor(Math.random() * this.productCatalog.length)];
    const performance = this.productPerformance.find(p => p.id === product.id);
    const amount = performance ? performance.avgPrice : 50;
    
    const saleEvent = {
      type: 'sale',
      product: product.name,
      amount: amount,
      timestamp: new Date()
    };

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sage-sale-event', {
        detail: saleEvent
      }));
    }
    
    return saleEvent;
  }

  // Export data for reports
  exportData(format = 'json', timeRange = 'month') {
    const data = {
      metrics: this.getMetrics(timeRange),
      revenueHistory: this.getRevenueHistory(),
      productPerformance: this.getProductPerformance(),
      experienceDistribution: this.getExperienceDistribution(),
      categoryDistribution: this.getCategoryDistribution(),
      conversionFunnel: this.getConversionFunnel(),
      generatedAt: new Date().toISOString()
    };
    
    if (format === 'csv') {
      return this.convertToCSV(data);
    }
    
    return JSON.stringify(data, null, 2);
  }

  convertToCSV(data) {
    // Simple CSV conversion for revenue history
    let csv = 'Date,Total Revenue,Sage Revenue,Direct Revenue,Transactions,Users\n';
    data.revenueHistory.forEach(day => {
      csv += `${day.date},${day.totalRevenue},${day.sageRevenue},${day.directRevenue},${day.transactions},${day.users}\n`;
    });
    return csv;
  }
}

// Initialize global instance
if (typeof window !== 'undefined') {
  window.sageAnalytics = new SageAnalyticsService();
}