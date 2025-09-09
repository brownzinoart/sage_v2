/**
 * Dashboard Main Application
 * Coordinates all dashboard modules and handles app-level functionality
 */

import DashboardData from './dashboard-data.js';
import DashboardCharts from './dashboard-charts.js';
import DashboardUI from './dashboard-ui.js';

class DashboardApp {
  constructor() {
    this.data = null;
    this.charts = null;
    this.ui = null;
    this.isInitialized = false;
    this.updateInterval = null;
    this.currentTimeRange = 'today';
    this.currentSection = 'overview';
    this.enableCharts = true; // Enable charts with mock datasets
    
    // Initialize immediately since we're called after DOM ready
    this.init();
  }
  
  async init() {
    try {
      console.log('🎯 Initializing dashboard components...');
      this.showLoading(true);
      
      // Initialize modules
      console.log('📊 Creating data module...');
      this.data = new DashboardData();
      
      if (this.enableCharts) {
        console.log('📈 Creating charts module...');
        this.charts = new DashboardCharts();
      }
      
      console.log('🎨 Creating UI module...');
      this.ui = new DashboardUI();
      
      // Wait for data to be ready
      console.log('📊 Initializing data...');
      await this.data.initialize();
      
      // Initialize UI
      console.log('🎨 Initializing UI...');
      this.ui.init();
      
      // Update KPI cards immediately with mock data
      await this.updateKPIs();
      
      // Initialize charts with mock datasets
      if (this.enableCharts) {
        if (!this.charts) this.charts = new DashboardCharts();
        console.log('📈 Initializing charts...');
        const chartData = {
          revenue: await this.data.getRevenueSeries(this.currentTimeRange),
          conversion: await this.data.getConversionFunnel(),
          traffic: await this.data.getTrafficSources(),
          sales: await this.data.getSalesPerformance(),
          performance: await this.data.getPerformanceMetrics()
        };
        try {
          await this.charts.init(chartData);
        } catch (e) {
          console.warn('Charts init issue (non-blocking):', e);
        }
      }
      
      // Setup event listeners
      console.log('🎯 Setting up event listeners...');
      this.setupEventListeners();
      
      // Initial load
      console.log('🚀 Loading dashboard...');
      await this.loadDashboard();
      
      // Start real-time updates
      this.startRealTimeUpdates();
      
      this.isInitialized = true;
      this.showLoading(false);
      
      console.log('✅ Dashboard initialized successfully');
      
    } catch (error) {
      console.error('❌ Dashboard initialization failed:', error);
      this.showError('Failed to initialize dashboard. Please refresh the page.');
    }
  }
  
  setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.target.closest('.nav-link').dataset.section;
        this.switchSection(section);
      });
    });
    
    // Date range selector
    document.querySelectorAll('.date-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const range = e.target.dataset.range;
        this.changeTimeRange(range);
      });
    });
    
    // Chart controls
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('chart-control-btn')) {
        const chartId = e.target.dataset.chart;
        const view = e.target.dataset.view;
        this.updateChartView(chartId, view);
      }
    });
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        this.ui.toggleSidebar();
      });
    }
    
    // Panel toggle
    const panelToggle = document.getElementById('panel-toggle');
    if (panelToggle) {
      panelToggle.addEventListener('click', () => {
        this.ui.toggleRightPanel();
      });
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshData();
      });
    }
    
    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportData();
      });
    }
    
    // Search and filter
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterTransactions(e.target.value);
      });
    }
    
    const filterSelect = document.querySelector('.filter-select');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.filterTransactions(null, e.target.value);
      });
    }
    
    // Insight actions
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('insight-action')) {
        this.handleInsightAction(e.target);
      }
    });
    
    // Window events
    window.addEventListener('resize', () => {
      this.handleResize();
    });
    
    window.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyboardShortcuts(e);
    });
  }
  
  async loadDashboard() {
    try {
      // Load KPI data
      await this.updateKPIs();
      
      // Load charts (optional)
      if (this.enableCharts) {
        await this.loadCharts();
      }
      
      // Load data table
      await this.updateTransactionsTable();
      
      // Load activity feed
      await this.updateActivityFeed();
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      this.showError('Error loading dashboard data');
    }
  }
  
  async updateKPIs() {
    const metrics = await this.data.getMetrics(this.currentTimeRange);
    
    // Update KPI values with animation
    this.animateValue('revenue-kpi', metrics.revenue.current, '$');
    this.animateValue('users-kpi', metrics.users.active);
    this.animateValue('conversion-kpi', (metrics.conversion.rate * 100).toFixed(1), '%');
    this.animateValue('aov-kpi', metrics.aov.current, '$');
    
    // Update sparklines
    this.updateSparklines(metrics);
  }
  
  // Old loadCharts removed (heatmap no longer used)
  
  // Old table/feed updaters removed; using aligned implementations below
  
  updateSparklines(metrics) {
    // Create simple sparkline charts for each KPI
    const sparklines = ['revenue', 'users', 'conversion', 'aov'];
    
    sparklines.forEach(async (type) => {
      const data = await this.data.getSparklineData(type, 7);
      this.charts.createSparkline(`${type}-sparkline`, data);
    });
  }
  
  // Heatmap creator removed
  
  // Old table/feed renderers removed
  
  async changeTimeRange(range) {
    if (range === this.currentTimeRange) return;
    
    this.currentTimeRange = range;
    
    // Update active button
    document.querySelectorAll('.date-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.range === range);
    });
    
    // Update data
    await this.updateKPIs();
    
    // Update charts with new range
    if (this.enableCharts && this.charts) {
      const chartData = {
        revenue: await this.data.getRevenueSeries(range),
        conversion: await this.data.getConversionFunnel(),
        traffic: await this.data.getTrafficSources(),
        sales: await this.data.getSalesPerformance(),
        performance: await this.data.getPerformanceMetrics()
      };
      this.charts.updateCharts(chartData);
    }
  }
  
  switchSection(section) {
    if (section === this.currentSection) return;
    
    this.currentSection = section;
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.section === section);
    });
    
    // Update page title and breadcrumb
    const titles = {
      overview: 'Analytics Overview',
      analytics: 'Analytics Details',
      products: 'Product Performance',
      users: 'User Analytics',
      insights: 'AI Insights'
    };
    
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) {
      pageTitle.textContent = titles[section] || 'Dashboard';
    }
    
    const breadcrumbCurrent = document.querySelector('.breadcrumb-item.current');
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = titles[section] || section;
    }
    
    // Load section-specific data if needed
    this.loadSectionData(section);
  }
  
  async loadSectionData(section) {
    // Load data specific to each section
    switch (section) {
      case 'products':
        const productData = await this.data.getProductPerformance();
        this.renderProductsSection(productData);
        break;
      case 'users':
        const userData = await this.data.getUserAnalytics();
        this.renderUsersSection(userData);
        break;
      case 'insights':
        const insightsData = await this.data.getAIInsights();
        this.renderInsightsSection(insightsData);
        break;
    }
  }
  
  updateChartView(chartId, view) {
    // Update chart view buttons
    const container = document.querySelector(`[data-chart="${chartId}"]`).closest('.chart-card');
    container.querySelectorAll('.chart-control-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    // Update chart
    this.charts.updateChartView(chartId, view);
  }
  
  async refreshData() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        refreshBtn.style.transform = 'rotate(0deg)';
      }, 500);
    }
    
    try {
      await this.data.refresh();
      await this.loadDashboard();
      this.showNotification('Data refreshed successfully', 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      this.showNotification('Error refreshing data', 'error');
    }
  }
  
  async exportData() {
    try {
      const data = await this.data.exportData('json', this.currentTimeRange);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `sage-analytics-${this.currentTimeRange}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showNotification('Data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showNotification('Error exporting data', 'error');
    }
  }
  
  filterTransactions(query, type) {
    // Implement transaction filtering
    const tbody = document.getElementById('transactions-body');
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const text = Array.from(cells).map(cell => cell.textContent.toLowerCase()).join(' ');
      
      const matchesQuery = !query || text.includes(query.toLowerCase());
      const matchesType = !type || type === 'all' || text.includes(type.toLowerCase());
      
      row.style.display = matchesQuery && matchesType ? '' : 'none';
    });
  }
  
  handleInsightAction(button) {
    const card = button.closest('.insight-card');
    const title = card.querySelector('.insight-title').textContent;
    
    // Simulate action
    const originalText = button.textContent;
    button.textContent = 'Processing...';
    button.disabled = true;
    
    setTimeout(() => {
      button.textContent = 'Done!';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1500);
    }, 1000);
    
    this.showNotification(`Action triggered: ${title}`, 'success');
  }
  
  handleResize() {
    // Handle window resize
    if (this.charts) {
      if (typeof this.charts.resizeCharts === 'function') {
        this.charts.resizeCharts();
      }
    }
  }
  
  handleVisibilityChange() {
    if (document.hidden) {
      this.pauseRealTimeUpdates();
    } else {
      this.resumeRealTimeUpdates();
    }
  }
  
  handleKeyboardShortcuts(e) {
    // Implement keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'r':
          e.preventDefault();
          this.refreshData();
          break;
        case 'e':
          e.preventDefault();
          this.exportData();
          break;
        case '1':
          e.preventDefault();
          this.switchSection('overview');
          break;
        case '2':
          e.preventDefault();
          this.switchSection('analytics');
          break;
        case '3':
          e.preventDefault();
          this.switchSection('products');
          break;
      }
    }
  }
  
  startRealTimeUpdates() {
    // Update every 30 seconds
    this.updateInterval = setInterval(() => {
      if (!document.hidden && this.isInitialized) {
        this.updateKPIs();
        this.updateActivityFeed();
      }
    }, 30000);
    
    // Simulate sale events
    setInterval(() => {
      if (!document.hidden && Math.random() < 0.1) {
        this.simulateSaleEvent();
      }
    }, 60000);
  }
  
  pauseRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
  
  resumeRealTimeUpdates() {
    this.startRealTimeUpdates();
  }
  
  simulateSaleEvent() {
    const amounts = [45.50, 67.25, 89.50, 123.75, 156.00];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    
    this.showSaleNotification(amount);
  }
  
  // Utility methods
  formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(Math.round(Number(value) || 0));
  }

  formatCurrency(value) {
    return `$${this.formatNumber(value)}`;
  }

  animateValue(elementId, targetValue, prefix = '', duration = 1000) {
    const element = document.getElementById(elementId);
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
      
      const formatted = this.formatNumber(currentValue);
      element.textContent = prefix + formatted;
    }, 16);
  }
  
  formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return time.toLocaleDateString();
  }
  
  getTimeAgo(timestamp) {
    return this.formatTime(timestamp);
  }
  
  getActivityIcon(type) {
    const icons = {
      query: '❓',
      product_view: '👁️',
      add_to_cart: '🛒',
      purchase: '💳',
      recommendation: '🎯'
    };
    return icons[type] || '📝';
  }
  
  getActivityDescription(activity) {
    switch (activity.type) {
      case 'query':
        return `Asked: "${activity.query?.substring(0, 40)}..."`;
      case 'product_view':
        return `Viewed ${activity.product?.name}`;
      case 'add_to_cart':
        return `Added ${activity.product?.name} to cart`;
      case 'purchase':
        return `Purchased ${activity.product?.name} for $${activity.totalAmount?.toFixed(2)}`;
      case 'recommendation':
        return `Recommended ${activity.product?.name}`;
      default:
        return 'Unknown activity';
    }
  }
  
  showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.toggle('hidden', !show);
    }
  }
  
  showError(message) {
    console.error('Dashboard Error:', message);
    this.showNotification(message, 'error');
  }
  
  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">${type === 'success' ? '✅' : '❌'}</div>
        <div class="notification-text">
          <p class="notification-message">${message}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('hidden'), 100);
    setTimeout(() => {
      notification.classList.remove('hidden');
    }, 3000);
    
    setTimeout(() => {
      notification.classList.add('hidden');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 5000);
  }
  
  showSaleNotification(amount) {
    const notification = document.getElementById('success-notification');
    if (!notification) return;
    
    const messageEl = notification.querySelector('.notification-message');
    if (messageEl) {
      messageEl.textContent = `$${amount.toFixed(2)} from Sage referral`;
    }
    
    notification.classList.remove('hidden');
    
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 4000);
  }
  
  // Update KPI cards with current data
  async updateKPIs() {
    try {
      const metrics = await this.data.getMetrics(this.currentTimeRange);
      console.log('📊 Updating KPIs with metrics:', metrics);
      
      // Update revenue KPI
      const revenueKPI = document.getElementById('revenue-kpi');
      if (revenueKPI) revenueKPI.textContent = this.formatCurrency(metrics.revenue.current);
      
      // Update users KPI
      const usersKPI = document.getElementById('users-kpi');
      if (usersKPI) {
        usersKPI.textContent = metrics.users.active.toString();
      }
      
      // Update conversion KPI
      const conversionKPI = document.getElementById('conversion-kpi');
      if (conversionKPI) {
        conversionKPI.textContent = `${Math.round(metrics.conversion.rate * 100)}%`;
      }
      
      // Update AOV KPI
      const aovKPI = document.getElementById('aov-kpi');
      if (aovKPI) aovKPI.textContent = this.formatCurrency(metrics.aov.current);
      
    } catch (error) {
      console.error('Error updating KPIs:', error);
    }
  }
  
  // Load and render all charts
  async loadCharts() {
    try {
      console.log('📈 Loading charts...');
      
      // Get chart data from data module
      const chartData = {
        revenue: await this.data.getRevenueSeries(this.currentTimeRange),
        conversion: await this.data.getConversionFunnel(),
        traffic: await this.data.getTrafficSources(),
        sales: await this.data.getSalesPerformance(),
        performance: await this.data.getPerformanceMetrics()
      };
      
      console.log('📊 Chart data loaded:', chartData);
      
      // Update charts using the charts module
      if (this.charts) this.charts.updateCharts(chartData);
      
    } catch (error) {
      console.error('Error loading charts:', error);
    }
  }
  
  // Update transactions table with recent data (aligned to DashboardData)
  async updateTransactionsTable() {
    try {
      console.log('📋 Updating transactions table...');
      const transactions = await this.data.getRecentTransactions(20);
      const tableBody = document.getElementById('transactions-body');
      if (!tableBody) return;

      tableBody.innerHTML = '';
      transactions.forEach(txn => {
        const row = document.createElement('tr');
        const amountText = txn.amount != null ? `$${Number(txn.amount).toFixed(2)}` : '—';
        row.innerHTML = `
          <td>${this.formatTime(txn.timestamp)}</td>
          <td><span class="badge badge-${this.getTypeClass(txn.type)}">${txn.type}</span></td>
          <td>${txn.product?.name || '—'}</td>
          <td>${txn.experienceLevel || '—'}</td>
          <td>${amountText}</td>
        `;
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error('Error updating transactions table:', error);
    }
  }
  
  // Update activity feed (aligned to DashboardData)
  async updateActivityFeed() {
    try {
      console.log('🔔 Updating activity feed...');
      const activities = await this.data.getActivityFeed(10);
      const activityFeed = document.getElementById('activity-feed');
      if (!activityFeed) return;

      activityFeed.innerHTML = '';
      activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
          <div class="activity-icon">${this.getActivityIcon(activity.type)}</div>
          <div class="activity-content">
            <div class="activity-text">${this.getActivityDescription(activity)}</div>
            <div class="activity-meta">
              <span class="activity-time">${this.getTimeAgo(activity.timestamp)}</span>
              <span class="activity-user">${activity.experienceLevel || 'User'}</span>
            </div>
          </div>
        `;
        activityFeed.appendChild(item);
      });
    } catch (error) {
      console.error('Error updating activity feed:', error);
    }
  }
  
  // Helper methods
  formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  getTypeClass(type) {
    const map = {
      purchase: 'success',
      query: 'primary',
      product_view: 'warning',
      add_to_cart: 'primary'
    };
    return map[type] || 'primary';
  }
  
  getActivityIcon(type) {
    const icons = {
      'purchase': '💰',
      'query': '❓',
      'recommendation': '💡',
      'view': '👁️'
    };
    return icons[type] || '📊';
  }
}

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardApp();
  });
} else {
  window.dashboard = new DashboardApp();
}

export default DashboardApp;
