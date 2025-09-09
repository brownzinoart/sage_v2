/**
 * Dashboard Data Module
 * Handles all data operations, API calls, and data transformations
 */

class DashboardData {
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
    
    // Initialize data stores
    this.activityFeed = [];
    this.recentTransactions = [];
    this.revenueHistory = [];
    this.productPerformance = [];
    
    this.isInitialized = false;
  }
  
  async initialize() {
    try {
      // Generate initial data
      this.revenueHistory = this.generateRevenueHistory();
      this.productPerformance = this.generateProductPerformance();
      this.activityFeed = this.generateInitialActivity();
      this.recentTransactions = this.generateInitialTransactions();
      
      this.isInitialized = true;
      console.log('📊 Dashboard data initialized');
      
    } catch (error) {
      console.error('Failed to initialize dashboard data:', error);
      throw error;
    }
  }
  
  // Core data methods
  async getMetrics(timeRange = 'today') {
    if (!this.isInitialized) await this.initialize();
    
    const metrics = { ...this.baseMetrics };
    
    // Adjust metrics based on time range
    switch (timeRange) {
      case '7d':
      case 'week':
        metrics.revenue.current = metrics.revenue.week;
        metrics.users.active = Math.round(metrics.users.active * 7.2);
        break;
      case '30d':
      case 'month':
        metrics.revenue.current = metrics.revenue.month;
        metrics.users.active = Math.round(metrics.users.active * 28.5);
        break;
      default:
        metrics.revenue.current = metrics.revenue.today;
    }
    
    // Add some random variation to simulate real-time changes
    this.addRandomVariation(metrics, timeRange);
    
    return metrics;
  }
  
  async getRevenueHistory(timeRange = 'today', days = 30) {
    if (!this.isInitialized) await this.initialize();
    
    let data = [...this.revenueHistory];
    
    switch (timeRange) {
      case 'today':
        data = this.generateHourlyData();
        break;
      case '7d':
        data = data.slice(-7);
        break;
      case '30d':
        data = data.slice(-30);
        break;
      default:
        data = data.slice(-days);
    }
    
    return data;
  }

  // Adapter: return revenue line-series for charts
  async getRevenueSeries(timeRange = '30d') {
    const history = await this.getRevenueHistory(timeRange);
    // If hourly data, history items may not have date labels. Normalize label as time or date.
    const labels = history.map(item => item.date || item.time || '');
    const values = history.map(item => item.sageRevenue ?? item.totalRevenue ?? item.value ?? 0);
    return { labels, values };
  }
  
  async getActivityFeed(limit = 10) {
    if (!this.isInitialized) await this.initialize();
    
    // Add new activity periodically
    if (Math.random() < 0.3) {
      this.addNewActivity();
    }
    
    return this.activityFeed.slice(0, limit);
  }

  // Traffic sources distribution for horizontal bar chart
  async getTrafficSources() {
    if (!this.isInitialized) await this.initialize();
    const labels = ['Organic', 'Direct', 'Referral', 'Paid', 'Social'];
    const values = [5200, 4100, 1800, 1300, 900].map(v => Math.round(v * (0.9 + Math.random() * 0.2)));
    return { labels, values };
  }

  // Conversion funnel percentages for doughnut chart
  async getConversionFunnel() {
    if (!this.isInitialized) await this.initialize();
    const labels = ['Queries', 'Product Views', 'Add to Cart', 'Purchases'];
    // Base percentages: queries=100, views ~75, add to cart ~45, purchases ~23
    const values = [100, 75 + Math.random() * 5, 45 + Math.random() * 5, 23 + Math.random() * 3].map(v => Math.round(v));
    return { labels, values };
  }

  // Sales vs Target for grouped bars
  async getSalesPerformance() {
    if (!this.isInitialized) await this.initialize();
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const base = [3200, 2800, 3000, 3500, 4200, 5200, 4800];
    const sales = base.map(v => Math.round(v * (0.9 + Math.random() * 0.2)));
    const targets = base.map(v => Math.round(v * 1.05));
    return { labels, sales, targets };
  }

  // Performance radar metrics (0-100)
  async getPerformanceMetrics() {
    if (!this.isInitialized) await this.initialize();
    const labels = ['Response', 'Relevance', 'Conversion', 'Retention', 'Upsell'];
    const current = [82, 76, 68, 73, 59].map(v => Math.round(v * (0.95 + Math.random() * 0.1)));
    const previous = [74, 71, 61, 65, 54];
    return { labels, current, previous };
  }

  // Heatmap removed from UI
  
  async getRecentTransactions(limit = 50) {
    if (!this.isInitialized) await this.initialize();
    
    // Add new transactions periodically
    if (Math.random() < 0.2) {
      this.addNewTransaction();
    }
    
    return this.recentTransactions.slice(0, limit);
  }
  
  async getProductPerformance(sortBy = 'revenue', limit = 10) {
    if (!this.isInitialized) await this.initialize();
    
    const sorted = [...this.productPerformance].sort((a, b) => b[sortBy] - a[sortBy]);
    return sorted.slice(0, limit);
  }
  
  async getExperienceDistribution() {
    if (!this.isInitialized) await this.initialize();
    
    const total = this.baseMetrics.users.active;
    return {
      'New': Math.round(total * 0.25),
      'Casual': Math.round(total * 0.55),
      'Experienced': Math.round(total * 0.20)
    };
  }
  
  async getCategoryDistribution() {
    if (!this.isInitialized) await this.initialize();
    
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
  
  async getPeakHours() {
    if (!this.isInitialized) await this.initialize();
    
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
  
  async getSparklineData(type, days = 7) {
    if (!this.isInitialized) await this.initialize();
    
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      let value;
      switch (type) {
        case 'revenue':
          value = 2000 + Math.random() * 1000 + Math.sin(i / 7 * Math.PI) * 500;
          break;
        case 'users':
          value = 300 + Math.random() * 100 + Math.sin(i / 7 * Math.PI) * 50;
          break;
        case 'conversion':
          value = 0.15 + Math.random() * 0.1 + Math.sin(i / 7 * Math.PI) * 0.05;
          break;
        case 'aov':
          value = 60 + Math.random() * 20 + Math.sin(i / 7 * Math.PI) * 10;
          break;
        default:
          value = Math.random() * 100;
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, value)
      });
    }
    
    return data;
  }
  
  async getUserAnalytics() {
    if (!this.isInitialized) await this.initialize();
    
    return {
      demographics: {
        ages: { '18-25': 15, '26-35': 35, '36-45': 25, '46-55': 15, '55+': 10 },
        experience: { 'New': 25, 'Casual': 55, 'Experienced': 20 }
      },
      behavior: {
        avgSessionTime: 8.5,
        avgQueriesPerSession: 2.3,
        topDevices: { 'Mobile': 65, 'Desktop': 30, 'Tablet': 5 }
      }
    };
  }
  
  async getAIInsights() {
    if (!this.isInitialized) await this.initialize();
    
    return [
      {
        type: 'trending',
        title: 'Rising Demand',
        description: 'CBD products showing 45% increase in queries over past week',
        confidence: 0.92,
        action: 'Consider expanding CBD inventory'
      },
      {
        type: 'warning',
        title: 'Stock Alert',
        description: 'Blue Dream popularity up 67% but inventory low',
        confidence: 0.87,
        action: 'Reorder immediately'
      },
      {
        type: 'opportunity',
        title: 'New Segment',
        description: 'Increase in medical consultation queries from seniors',
        confidence: 0.78,
        action: 'Develop senior-focused education content'
      }
    ];
  }
  
  async refresh() {
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add small variations to simulate real-time changes
    this.addRandomVariation(this.baseMetrics);
    
    // Generate some new activity
    this.addNewActivity();
    this.addNewTransaction();
    
    console.log('📊 Data refreshed');
  }
  
  async exportData(format = 'json', timeRange = 'month') {
    if (!this.isInitialized) await this.initialize();
    
    const data = {
      metrics: await this.getMetrics(timeRange),
      revenueHistory: await this.getRevenueHistory(timeRange),
      productPerformance: await this.getProductPerformance(),
      experienceDistribution: await this.getExperienceDistribution(),
      categoryDistribution: await this.getCategoryDistribution(),
      recentTransactions: this.recentTransactions.slice(0, 100),
      generatedAt: new Date().toISOString(),
      timeRange
    };
    
    if (format === 'csv') {
      return this.convertToCSV(data);
    }
    
    return JSON.stringify(data, null, 2);
  }
  
  // Data generation methods
  generateRevenueHistory(days = 30) {
    const history = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Base revenue with weekend spikes and random variation
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      let baseRevenue = isWeekend ? 3200 : 2400;
      
      // Add seasonal variation and growth trend
      const seasonalMultiplier = 0.8 + Math.sin((i / 30) * Math.PI) * 0.3;
      const growthMultiplier = 1 + (0.125 / 30) * (30 - i);
      const randomVariation = 0.7 + Math.random() * 0.6;
      
      const revenue = Math.round(baseRevenue * seasonalMultiplier * growthMultiplier * randomVariation);
      const sageRevenue = Math.round(revenue * (0.15 + Math.random() * 0.1));
      
      history.push({
        date: date.toISOString().split('T')[0],
        totalRevenue: revenue,
        sageRevenue: sageRevenue,
        directRevenue: revenue - sageRevenue,
        transactions: Math.round(sageRevenue / 67.5),
        users: Math.round((sageRevenue / 67.5) * 1.3)
      });
    }
    
    return history;
  }
  
  generateHourlyData() {
    const hourlyData = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now);
      hour.setHours(hour.getHours() - i, 0, 0, 0);
      
      const baseRevenue = this.getHourlyBaseRevenue(hour.getHours());
      const variation = 0.7 + Math.random() * 0.6;
      const totalRevenue = Math.round(baseRevenue * variation);
      const sageRevenue = Math.round(totalRevenue * (0.15 + Math.random() * 0.1));
      
      hourlyData.push({
        date: hour.toISOString(),
        hour: hour.getHours(),
        totalRevenue,
        sageRevenue,
        directRevenue: totalRevenue - sageRevenue,
        transactions: Math.round(sageRevenue / 67.5),
        users: Math.round((sageRevenue / 67.5) * 1.3)
      });
    }
    
    return hourlyData;
  }
  
  getHourlyBaseRevenue(hour) {
    if (hour >= 9 && hour <= 11) return 180; // Morning peak
    if (hour >= 17 && hour <= 21) return 250; // Evening peak
    if (hour >= 14 && hour <= 16) return 120; // Afternoon
    if (hour >= 22 || hour <= 1) return 80;   // Late night
    return 40; // Off hours
  }
  
  generateProductPerformance() {
    return this.productCatalog.map(product => {
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
      const conversionRate = 0.15 + Math.random() * 0.15;
      const conversions = Math.round(baseClicks * conversionRate);
      
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
        inventory: Math.round(20 + Math.random() * 80),
        trend: -0.1 + Math.random() * 0.2
      };
    });
  }
  
  generateInitialActivity(count = 20) {
    const activities = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now - (i * 1000 * 60 * Math.random() * 30)); // Last 30 minutes
      activities.push(this.generateActivityEvent(timestamp));
    }
    
    return activities.sort((a, b) => b.timestamp - a.timestamp);
  }
  
  generateInitialTransactions(count = 50) {
    const transactions = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(now - (i * 1000 * 60 * Math.random() * 120)); // Last 2 hours
      transactions.push(this.generateTransactionEvent(timestamp));
    }
    
    return transactions.sort((a, b) => b.timestamp - a.timestamp);
  }
  
  generateActivityEvent(timestamp = new Date()) {
    const eventTypes = [
      { type: 'query', weight: 40 },
      { type: 'product_view', weight: 30 },
      { type: 'add_to_cart', weight: 15 },
      { type: 'purchase', weight: 10 },
      { type: 'recommendation', weight: 5 }
    ];
    
    const selectedType = this.weightedRandomSelect(eventTypes);
    const userId = `user_${Math.floor(Math.random() * 1000)}`;
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
        event.product = this.productCatalog[Math.floor(Math.random() * this.productCatalog.length)];
        break;
        
      case 'add_to_cart':
        event.product = this.productCatalog[Math.floor(Math.random() * this.productCatalog.length)];
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
        event.product = this.productCatalog[Math.floor(Math.random() * this.productCatalog.length)];
        event.confidence = 0.7 + Math.random() * 0.3;
        break;
    }
    
    return event;
  }
  
  generateTransactionEvent(timestamp = new Date()) {
    const types = ['query', 'product_view', 'purchase', 'add_to_cart'];
    const type = types[Math.floor(Math.random() * types.length)];
    const product = this.productCatalog[Math.floor(Math.random() * this.productCatalog.length)];
    const experienceLevel = this.experienceLevels[Math.floor(Math.random() * this.experienceLevels.length)];
    
    let amount = null;
    if (type === 'purchase') {
      const performance = this.productPerformance.find(p => p.id === product.id);
      amount = performance ? performance.avgPrice * (1 + Math.random() * 0.5) : 50 + Math.random() * 50;
    }
    
    return {
      id: `txn_${timestamp.getTime()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      type,
      product: type.includes('product') || type === 'purchase' ? product : null,
      experienceLevel,
      amount
    };
  }
  
  addNewActivity() {
    const newActivity = this.generateActivityEvent();
    this.activityFeed.unshift(newActivity);
    
    // Keep only last 100 activities
    if (this.activityFeed.length > 100) {
      this.activityFeed = this.activityFeed.slice(0, 100);
    }
  }
  
  addNewTransaction() {
    const newTransaction = this.generateTransactionEvent();
    this.recentTransactions.unshift(newTransaction);
    
    // Keep only last 200 transactions
    if (this.recentTransactions.length > 200) {
      this.recentTransactions = this.recentTransactions.slice(0, 200);
    }
  }
  
  addRandomVariation(metrics, timeRange) {
    // Add small random variations to simulate real-time changes
    const variation = timeRange === 'today' ? 0.02 : 0.01; // 2% for today, 1% for longer periods
    
    metrics.revenue.current *= (1 + (Math.random() - 0.5) * variation);
    metrics.users.active = Math.round(metrics.users.active * (1 + (Math.random() - 0.5) * variation));
    metrics.conversion.rate *= (1 + (Math.random() - 0.5) * variation * 0.5);
    metrics.aov.current *= (1 + (Math.random() - 0.5) * variation * 0.5);
    
    // Ensure reasonable bounds
    metrics.revenue.current = Math.max(0, metrics.revenue.current);
    metrics.users.active = Math.max(0, metrics.users.active);
    metrics.conversion.rate = Math.max(0.05, Math.min(0.5, metrics.conversion.rate));
    metrics.aov.current = Math.max(10, metrics.aov.current);
  }
  
  // Utility methods
  weightedRandomSelect(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of items) {
      random -= item.weight;
      if (random <= 0) {
        return item;
      }
    }
    
    return items[0];
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
  
  convertToCSV(data) {
    let csv = 'Date,Total Revenue,Sage Revenue,Direct Revenue,Transactions,Users\n';
    data.revenueHistory.forEach(day => {
      csv += `${day.date},${day.totalRevenue},${day.sageRevenue},${day.directRevenue},${day.transactions},${day.users}\n`;
    });
    return csv;
  }
}

export default DashboardData;
