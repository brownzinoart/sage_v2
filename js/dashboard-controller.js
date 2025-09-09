/**
 * Copyright (c) 2025-2026 One Block Away LLC
 * All rights reserved. Proprietary and confidential.
 * 
 * Dashboard Controller - Manages dashboard state, UI updates, and real-time data
 */

class SageDashboardController {
  constructor() {
    this.analytics = null;
    this.chartsRenderer = null;
    this.currentTimeRange = 'today';
    this.isActive = false;
    this.updateInterval = null;
    this.celebrationQueue = [];
    this.initAttempts = 0;
    this.maxInitAttempts = 50; // Max 5 seconds
    
    // DOM element references
    this.elements = {};
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeDashboard());
    } else {
      this.initializeDashboard();
    }
  }

  initializeDashboard() {
    console.log('=== Dashboard initialization started ===');
    console.log('Current attempt:', this.initAttempts + 1);
    console.log('window.sageAnalytics exists:', typeof window.sageAnalytics !== 'undefined');
    console.log('SageChartsRenderer exists:', typeof SageChartsRenderer !== 'undefined');
    console.log('Chart.js exists:', typeof Chart !== 'undefined');
    
    try {
      // Get element references
      this.cacheElementReferences();
      console.log('Element references cached');
      
      // Wait for analytics service to be ready
      if (!window.sageAnalytics) {
        this.initAttempts++;
        if (this.initAttempts >= this.maxInitAttempts) {
          console.error(`Analytics service failed to load after ${this.maxInitAttempts} attempts`);
          this.showError('Analytics service failed to load');
          return;
        }
        console.log(`Waiting for analytics service... (attempt ${this.initAttempts}/${this.maxInitAttempts})`);
        setTimeout(() => this.initializeDashboard(), 100);
        return;
      }
      
      console.log('Analytics service found, initializing...');
      
      // Initialize services
      this.analytics = window.sageAnalytics;
      
      // Initialize charts renderer (optional). If Chart.js isn't loaded, continue without charts.
      if (typeof SageChartsRenderer !== 'undefined') {
        console.log('Creating charts renderer...');
        this.chartsRenderer = new SageChartsRenderer();
        console.log('Charts renderer created successfully');
      } else {
        console.warn('Charts renderer not available; proceeding without charts');
      }
      
      if (!this.analytics) {
        console.error('Analytics service not available after assignment');
        this.showError('Analytics service not available');
        return;
      }
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initial data load
      this.loadInitialData();
      
      // Start real-time updates
      this.startRealTimeUpdates();
      
      this.isActive = true;
      console.log('Dashboard initialized successfully');
      
    } catch (error) {
      console.error('Dashboard initialization failed:', error);
      this.showError('Failed to initialize dashboard');
    }
  }

  cacheElementReferences() {
    const elements = [
      'revenue-value', 'users-value', 'conversion-value', 'aov-value',
      'activity-feed', 'products-grid', 'success-overlay'
    ];
    
    elements.forEach(id => {
      this.elements[id] = document.getElementById(id);
      if (!this.elements[id]) {
        console.warn(`Element not found: ${id}`);
      }
    });

    // Cache button groups - updated for new class names
    this.elements.rangeButtons = document.querySelectorAll('.time-btn');
    this.elements.chartButtons = document.querySelectorAll('.chart-btn');
  }

  setupEventListeners() {
    // Time range selector
    this.elements.rangeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleTimeRangeChange(e));
    });

    // Export button - updated selector
    const exportBtn = document.querySelector('.btn-secondary');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExport());
    }

    // Chart view toggles
    this.elements.chartButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleChartViewChange(e));
    });

    // Analytics service events
    window.addEventListener('sage-analytics-update', (e) => {
      this.handleAnalyticsUpdate(e.detail);
    });

    // Sale celebration events
    window.addEventListener('sage-sale-event', (e) => {
      this.handleSaleEvent(e.detail);
    });

    // Insight action buttons
    document.querySelectorAll('.insight-action').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleInsightAction(e));
    });

    // Visibility change handling
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseUpdates();
      } else {
        this.resumeUpdates();
      }
    });
  }

  loadInitialData() {
    // Load and display initial metrics
    this.updateMetrics();
    
    // Load activity feed
    this.updateActivityFeed();
    
    // Load product performance
    this.updateProductPerformance();
    
    // Initialize charts
    this.initializeCharts();
    
    // Trigger initial sale celebration after short delay
    setTimeout(() => {
      if (Math.random() < 0.3) { // 30% chance
        this.analytics.triggerSaleEvent();
      }
    }, 5000);
  }

  updateMetrics() {
    const metrics = this.analytics.getMetrics(this.currentTimeRange);
    
    // Animate metric values
    this.animateValue(this.elements['revenue-value'], metrics.revenue.current, 0, '$');
    this.animateValue(this.elements['users-value'], metrics.users.active, 0);
    this.animateValue(this.elements['conversion-value'], metrics.conversion.rate * 100, 1, '%');
    this.animateValue(this.elements['aov-value'], metrics.aov.current, 2, '$');
  }

  animateValue(element, targetValue, decimals = 0, prefix = '', duration = 1000) {
    if (!element) return;
    
    const startValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
    const increment = (targetValue - startValue) / (duration / 16);
    
    let currentValue = startValue;
    const timer = setInterval(() => {
      currentValue += increment;
      
      if ((increment > 0 && currentValue >= targetValue) || 
          (increment < 0 && currentValue <= targetValue)) {
        currentValue = targetValue;
        clearInterval(timer);
      }
      
      const displayValue = prefix + (decimals > 0 ? 
        currentValue.toFixed(decimals) : 
        Math.round(currentValue).toLocaleString());
        
      element.textContent = displayValue;
    }, 16);
  }

  updateActivityFeed() {
    const activities = this.analytics.getActivityFeed(10);
    const feedElement = this.elements['activity-feed'];
    
    if (!feedElement) return;
    
    feedElement.innerHTML = activities.map(activity => 
      this.createActivityItem(activity)
    ).join('');
  }

  createActivityItem(activity) {
    const timeAgo = this.getTimeAgo(activity.timestamp);
    const icon = this.getActivityIcon(activity.type);
    const description = this.getActivityDescription(activity);
    
    return `
      <div class="activity-item">
        <div class="activity-icon">${icon}</div>
        <div class="activity-content">
          <div class="activity-description">${description}</div>
          <div class="activity-meta">
            <span class="activity-time">${timeAgo}</span>
            <span class="activity-user">${activity.experienceLevel} User</span>
          </div>
        </div>
      </div>
    `;
  }

  getActivityIcon(type) {
    const icons = {
      'query': '❓',
      'product_view': '👁️',
      'add_to_cart': '🛒',
      'purchase': '💳',
      'recommendation': '🎯'
    };
    return icons[type] || '📝';
  }

  getActivityDescription(activity) {
    switch (activity.type) {
      case 'query':
        return `Asked: "${this.truncateText(activity.query, 50)}"`;
      case 'product_view':
        return `Viewed ${activity.product.name}`;
      case 'add_to_cart':
        return `Added ${activity.product.name} to cart`;
      case 'purchase':
        return `Purchased ${activity.product.name} for $${activity.totalAmount.toFixed(2)}`;
      case 'recommendation':
        return `Recommended ${activity.product.name} (${Math.round(activity.confidence * 100)}% match)`;
      default:
        return 'Unknown activity';
    }
  }

  updateProductPerformance() {
    const products = this.analytics.getProductPerformance('revenue', 6);
    const gridElement = this.elements['products-grid'];
    
    if (!gridElement) return;
    
    gridElement.innerHTML = products.map(product => 
      this.createProductItem(product)
    ).join('');
  }

  createProductItem(product) {
    const trendIcon = product.trend > 0 ? '↗️' : product.trend < 0 ? '↘️' : '→';
    const trendValue = (Math.abs(product.trend) * 100).toFixed(1) + '%';
    
    return `
      <div class="product-item">
        <div class="product-info">
          <div class="product-name">${product.name}</div>
          <div class="product-category">${product.category}</div>
        </div>
        <div class="product-metrics">
          <div class="product-revenue">$${product.revenue.toLocaleString()}</div>
          <div class="product-trend">${trendIcon} ${trendValue}</div>
        </div>
      </div>
    `;
  }

  initializeCharts() {
    if (!this.chartsRenderer) return;
    
    const revenueHistory = this.analytics.getRevenueHistory();
    const hasCharts = this.chartsRenderer && typeof Chart !== 'undefined';
    
    if (hasCharts) {
      // Revenue trend chart
      this.chartsRenderer.createRevenueChart('revenue-chart', revenueHistory);
      // Experience distribution
      const experienceData = this.analytics.getExperienceDistribution();
      this.chartsRenderer.createExperienceChart('experience-chart', experienceData);
      // Category distribution
      const categoryData = this.analytics.getCategoryDistribution();
      this.chartsRenderer.createCategoryChart('categories-chart', categoryData);
      // Comparison chart
      this.chartsRenderer.createComparisonChart('comparison-chart', revenueHistory);
    } else {
      console.warn('Chart.js not available; skipping chart rendering');
    }
    
    // Peak hours heatmap
    const hourlyData = this.analytics.getPeakHours();
    this.createHourlyHeatmap(hourlyData);
  }

  createHourlyHeatmap(hourlyData) {
    const heatmapElement = document.getElementById('hours-heatmap');
    if (!heatmapElement) return;
    
    const hours = hourlyData.map(hour => {
      const intensity = Math.round(hour.intensity * 100);
      const time = hour.hour === 0 ? '12 AM' : 
                   hour.hour < 12 ? `${hour.hour} AM` :
                   hour.hour === 12 ? '12 PM' : 
                   `${hour.hour - 12} PM`;
      
      return `
        <div class="hour-cell" style="background-color: rgba(99, 102, 241, ${hour.intensity})" 
             title="${time}: ${hour.queries} queries, ${hour.conversions} conversions">
          <span class="hour-label">${hour.hour}</span>
        </div>
      `;
    }).join('');
    
    heatmapElement.innerHTML = `
      <div class="heatmap-grid">${hours}</div>
      <div class="heatmap-legend">
        <span>Low</span>
        <div class="legend-gradient"></div>
        <span>High</span>
      </div>
    `;
  }

  startRealTimeUpdates() {
    // Update metrics every 30 seconds
    this.updateInterval = setInterval(() => {
      if (!document.hidden && this.isActive) {
        this.updateMetrics();
      }
    }, 30000);

    // Trigger random sale events
    setInterval(() => {
      if (!document.hidden && this.isActive && Math.random() < 0.1) { // 10% chance every minute
        this.analytics.triggerSaleEvent();
      }
    }, 60000);
  }

  handleAnalyticsUpdate(detail) {
    if (!this.isActive) return;
    
    switch (detail.type) {
      case 'new-activity':
        this.addActivityItem(detail.event);
        break;
      case 'metrics-update':
        this.updateMetrics();
        break;
    }
  }

  addActivityItem(activity) {
    const feedElement = this.elements['activity-feed'];
    if (!feedElement) return;
    
    const activityHTML = this.createActivityItem(activity);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = activityHTML;
    const activityElement = tempDiv.firstElementChild;
    
    // Add with animation
    activityElement.style.opacity = '0';
    activityElement.style.transform = 'translateX(-20px)';
    
    feedElement.insertBefore(activityElement, feedElement.firstChild);
    
    // Animate in
    setTimeout(() => {
      activityElement.style.transition = 'all 0.3s ease-out';
      activityElement.style.opacity = '1';
      activityElement.style.transform = 'translateX(0)';
    }, 50);
    
    // Remove excess items
    const items = feedElement.querySelectorAll('.activity-item');
    if (items.length > 10) {
      items[items.length - 1].remove();
    }
  }

  handleSaleEvent(saleDetail) {
    // Show celebration animation
    this.showSaleCelebration(saleDetail);
    
    // Update metrics immediately
    setTimeout(() => this.updateMetrics(), 1000);
  }

  showSaleCelebration(saleDetail) {
    const overlay = this.elements['success-overlay'];
    if (!overlay) return;
    
    // Update celebration content
    const amountElement = overlay.querySelector('.sale-details');
    if (amountElement) {
      amountElement.textContent = `$${saleDetail.amount.toFixed(2)} from Sage referral`;
    }
    
    // Show with animation
    overlay.style.display = 'flex';
    overlay.style.opacity = '0';
    
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.3s ease-out';
      overlay.style.opacity = '1';
    }, 50);
    
    // Hide after 3 seconds
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 300);
    }, 3000);
  }

  handleTimeRangeChange(e) {
    const newRange = e.target.dataset.range;
    if (newRange === this.currentTimeRange) return;
    
    // Update button states
    this.elements.rangeButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    this.currentTimeRange = newRange;
    
    // Update data
    this.updateMetrics();
    
    // Update charts if needed
    if (this.chartsRenderer) {
      const revenueHistory = this.analytics.getRevenueHistory();
      this.chartsRenderer.updateRevenueChart('revenue-chart', revenueHistory, newRange);
    }
  }

  handleChartViewChange(e) {
    const view = e.target.dataset.view;
    
    // Update button states
    e.target.parentElement.querySelectorAll('.chart-btn').forEach(btn => 
      btn.classList.remove('active')
    );
    e.target.classList.add('active');
    
    // Update chart view
    if (this.chartsRenderer) {
      this.chartsRenderer.updateChartView(view);
    }
  }

  handleExport() {
    try {
      const data = this.analytics.exportData('json', this.currentTimeRange);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `sage-analytics-${this.currentTimeRange}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showNotification('Report exported successfully', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      this.showNotification('Export failed', 'error');
    }
  }

  handleInsightAction(e) {
    e.preventDefault();
    const insightCard = e.target.closest('.insight-card');
    const title = insightCard.querySelector('h4').textContent;
    
    // Simulate action feedback
    const originalText = e.target.textContent;
    e.target.textContent = 'Processing...';
    e.target.disabled = true;
    
    setTimeout(() => {
      e.target.textContent = 'Done!';
      setTimeout(() => {
        e.target.textContent = originalText;
        e.target.disabled = false;
      }, 1500);
    }, 1000);
    
    this.showNotification(`Action triggered: ${title}`, 'info');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `dashboard-notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  showError(message) {
    console.error('Dashboard Error:', message);
    const appContainer = document.querySelector('.app');
    if (!appContainer) {
      // If no app container, create a simple error display
      document.body.innerHTML = `
        <div style="padding: 40px; text-align: center; color: white; background: var(--color-bg-primary);">
          <h2>Dashboard Error</h2>
          <p>${message}</p>
          <p>Check browser console for more details</p>
          <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; background: var(--color-accent); color: white; border: none; border-radius: 8px;">Reload Dashboard</button>
        </div>
      `;
      return;
    }
    
    appContainer.innerHTML = `
      <div class="dashboard-error" style="padding: 40px; text-align: center; color: white; background: var(--color-bg-primary); min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div class="error-icon" style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
        <h2 style="color: var(--color-fg); margin-bottom: 16px;">Dashboard Error</h2>
        <p style="color: var(--color-fg-muted); margin-bottom: 12px;">${message}</p>
        <p style="color: var(--color-subtle); margin-bottom: 24px; font-size: 14px;">Check browser console for more details</p>
        <button onclick="location.reload()" style="padding: 12px 24px; background: var(--color-accent); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-weight: 500;">Reload Dashboard</button>
      </div>
    `;
  }

  pauseUpdates() {
    this.isActive = false;
  }

  resumeUpdates() {
    this.isActive = true;
    this.updateMetrics();
    this.updateActivityFeed();
  }

  // Utility methods
  getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  }

  truncateText(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  destroy() {
    this.isActive = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    // Remove event listeners
    window.removeEventListener('sage-analytics-update', this.handleAnalyticsUpdate);
    window.removeEventListener('sage-sale-event', this.handleSaleEvent);
  }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('dashboard.html')) {
    window.sageDashboard = new SageDashboardController();
  }
});

// Export for testing
if (typeof window !== 'undefined') {
  window.SageDashboardController = SageDashboardController;
}
