// Dashboard UI Module - Interface Interactions and State Management
class DashboardUI {
  constructor() {
    this.state = {
      sidebarOpen: false,
      rightPanelOpen: false,
      currentDateRange: '7d',
      loading: false,
      theme: 'dark'
    };
    
    this.elements = {};
    this.eventListeners = new Map();
    this.notifications = [];
    this.modals = new Map();
  }

  // Initialize UI components
  init() {
    try {
      this.cacheElements();
      this.bindEvents();
      this.initializeComponents();
      this.setupKeyboardShortcuts();
      
      console.log('🎨 UI initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize UI:', error);
      return false;
    }
  }

  // Cache frequently used DOM elements
  cacheElements() {
    this.elements = {
      // Navigation
      sidebar: document.getElementById('sidebar'),
      sidebarToggle: document.querySelector('.sidebar-toggle'),
      navLinks: document.querySelectorAll('.nav-link'),
      
      // Panels
      rightPanel: document.querySelector('.right-panel'),
      rightPanelToggle: document.querySelector('.right-panel-toggle'),
      mobileOverlay: document.querySelector('.mobile-overlay'),
      
      // Date controls
      dateButtons: document.querySelectorAll('.date-btn'),
      customDateInputs: document.querySelectorAll('.custom-date input'),
      
      // Search and filters
      searchInput: document.querySelector('.search-input'),
      filterSelects: document.querySelectorAll('.filter-select'),
      
      // Action buttons
      actionButtons: document.querySelectorAll('.action-btn'),
      exportButton: document.querySelector('[data-action="export"]'),
      refreshButton: document.querySelector('[data-action="refresh"]'),
      settingsButton: document.querySelector('[data-action="settings"]'),
      
      // Charts controls
      chartControls: document.querySelectorAll('.chart-control-btn'),
      
      // Data table
      dataTable: document.querySelector('.data-table'),
      tableRows: document.querySelectorAll('.data-table tbody tr'),
      
      // Status indicators
      liveStatus: document.querySelector('.live-status'),
      connectionStatus: document.querySelector('.connection-status'),
      
      // Loading elements
      loadingOverlay: document.querySelector('.loading-overlay'),
      loadingSpinner: document.querySelector('.loading-spinner'),
      
      // Notification container
      notificationContainer: document.getElementById('notifications') || this.createNotificationContainer()
    };
  }

  // Bind event listeners
  bindEvents() {
    // Sidebar toggle
    this.addEventListeners(this.elements.sidebarToggle, 'click', this.toggleSidebar.bind(this));
    
    // Right panel toggle
    this.addEventListeners(this.elements.rightPanelToggle, 'click', this.toggleRightPanel.bind(this));
    
    // Mobile overlay
    this.addEventListeners(this.elements.mobileOverlay, 'click', this.closeMobilePanels.bind(this));
    
    // Navigation links
    this.elements.navLinks.forEach(link => {
      this.addEventListeners(link, 'click', this.handleNavigation.bind(this));
    });
    
    // Date range buttons
    this.elements.dateButtons.forEach(btn => {
      this.addEventListeners(btn, 'click', this.handleDateRangeChange.bind(this));
    });
    
    // Search input
    this.addEventListeners(this.elements.searchInput, 'input', 
      this.debounce(this.handleSearch.bind(this), 300));
    
    // Filter selects
    this.elements.filterSelects.forEach(select => {
      this.addEventListeners(select, 'change', this.handleFilterChange.bind(this));
    });
    
    // Action buttons
    this.addEventListeners(this.elements.exportButton, 'click', this.handleExport.bind(this));
    this.addEventListeners(this.elements.refreshButton, 'click', this.handleRefresh.bind(this));
    this.addEventListeners(this.elements.settingsButton, 'click', this.showSettings.bind(this));
    
    // Chart controls
    this.elements.chartControls.forEach(btn => {
      this.addEventListeners(btn, 'click', this.handleChartControl.bind(this));
    });
    
    // Table row selection
    this.elements.tableRows.forEach(row => {
      this.addEventListeners(row, 'click', this.handleTableRowClick.bind(this));
    });
    
    // Window events
    this.addEventListeners(window, 'resize', this.debounce(this.handleResize.bind(this), 150));
    this.addEventListeners(window, 'beforeunload', this.handleBeforeUnload.bind(this));
    
    // Escape key to close panels
    this.addEventListeners(document, 'keydown', this.handleKeyDown.bind(this));
  }

  // Initialize UI components
  initializeComponents() {
    this.updateConnectionStatus(true);
    this.setDateRange(this.state.currentDateRange);
    this.initializeTooltips();
    this.initializeDropdowns();
    this.checkViewport();
  }

  // Sidebar management
  toggleSidebar() {
    this.state.sidebarOpen = !this.state.sidebarOpen;
    this.elements.sidebar.classList.toggle('open', this.state.sidebarOpen);
    this.elements.mobileOverlay.classList.toggle('active', this.state.sidebarOpen);
    
    this.dispatchEvent('sidebar:toggle', { open: this.state.sidebarOpen });
  }

  // Right panel management
  toggleRightPanel() {
    this.state.rightPanelOpen = !this.state.rightPanelOpen;
    const width = window.innerWidth;

    // Desktop (>= 1200px): use collapsed/expanded width behavior
    if (width >= 1200) {
      // When opening, ensure 'collapsed' is removed; when closing, add it
      this.elements.rightPanel.classList.toggle('collapsed', !this.state.rightPanelOpen);
      // No overlay on desktop
      this.elements.mobileOverlay?.classList.remove('active');
    } else {
      // Tablet/mobile (< 1200px): use off-canvas open/close
      this.elements.rightPanel.classList.toggle('open', this.state.rightPanelOpen);
      this.elements.mobileOverlay?.classList.toggle('active', this.state.rightPanelOpen);
    }

    this.dispatchEvent('rightPanel:toggle', { open: this.state.rightPanelOpen });
  }

  // Close mobile panels
  closeMobilePanels() {
    this.state.sidebarOpen = false;
    this.state.rightPanelOpen = false;
    this.elements.sidebar.classList.remove('open');
    this.elements.rightPanel.classList.remove('open');
    // Ensure collapsed on desktop when closing
    this.elements.rightPanel.classList.add('collapsed');
    this.elements.mobileOverlay.classList.remove('active');
  }

  // Handle navigation
  handleNavigation(event) {
    event.preventDefault();
    const link = event.currentTarget;
    const section = link.dataset.section;
    
    // Update active state
    this.elements.navLinks.forEach(nav => nav.classList.remove('active'));
    link.classList.add('active');
    
    // Close mobile sidebar
    if (window.innerWidth <= 991) {
      this.closeMobilePanels();
    }
    
    this.dispatchEvent('navigation:change', { section });
  }

  // Handle date range changes
  handleDateRangeChange(event) {
    const button = event.currentTarget;
    const range = button.dataset.range;
    
    this.setDateRange(range);
    this.dispatchEvent('dateRange:change', { range });
  }

  // Set active date range
  setDateRange(range) {
    this.state.currentDateRange = range;
    
    this.elements.dateButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.range === range);
    });
  }

  // Handle search input
  handleSearch(event) {
    const query = event.target.value.trim();
    this.dispatchEvent('search:query', { query });
  }

  // Handle filter changes
  handleFilterChange(event) {
    const select = event.currentTarget;
    const filter = select.name;
    const value = select.value;
    
    this.dispatchEvent('filter:change', { filter, value });
  }

  // Handle export action
  handleExport(event) {
    event.preventDefault();
    this.showExportModal();
  }

  // Handle refresh action
  handleRefresh(event) {
    event.preventDefault();
    this.showLoading();
    this.dispatchEvent('data:refresh');
  }

  // Handle chart control buttons
  handleChartControl(event) {
    const button = event.currentTarget;
    const action = button.dataset.action;
    const chartId = button.closest('.chart-card').id;
    
    // Update button states
    const container = button.closest('.chart-controls');
    if (container) {
      container.querySelectorAll('.chart-control-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');
    }
    
    this.dispatchEvent('chart:control', { action, chartId });
  }

  // Handle table row clicks
  handleTableRowClick(event) {
    const row = event.currentTarget;
    const rowId = row.dataset.id;
    
    // Toggle selection
    row.classList.toggle('selected');
    
    this.dispatchEvent('table:rowSelect', { rowId, selected: row.classList.contains('selected') });
  }

  // Loading state management
  showLoading(message = 'Loading...') {
    this.state.loading = true;
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.style.display = 'flex';
      const text = this.elements.loadingOverlay.querySelector('.loading-text');
      if (text) text.textContent = message;
    }
  }

  hideLoading() {
    this.state.loading = false;
    if (this.elements.loadingOverlay) {
      this.elements.loadingOverlay.style.display = 'none';
    }
  }

  // Connection status management
  updateConnectionStatus(connected) {
    if (this.elements.connectionStatus) {
      const dot = this.elements.connectionStatus.querySelector('.status-dot');
      const text = this.elements.connectionStatus.querySelector('.status-text');
      
      if (dot) {
        dot.classList.toggle('connected', connected);
        dot.classList.toggle('disconnected', !connected);
      }
      
      if (text) {
        text.textContent = connected ? 'Live' : 'Offline';
      }
    }
  }

  // Notification system
  showNotification(message, type = 'info', duration = 5000) {
    const notification = this.createNotification(message, type);
    this.elements.notificationContainer.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
    
    // Auto remove
    setTimeout(() => {
      this.removeNotification(notification);
    }, duration);
    
    return notification;
  }

  createNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    notification.innerHTML = `
      <div class="notification-icon">${icons[type] || icons.info}</div>
      <div class="notification-content">
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close" aria-label="Close notification">×</button>
    `;
    
    // Close button handler
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => this.removeNotification(notification));
    
    return notification;
  }

  removeNotification(notification) {
    notification.classList.add('removing');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notifications';
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
  }

  // Modal management
  showExportModal() {
    const modal = this.createModal('export-modal', 'Export Data', `
      <div class="modal-form">
        <div class="form-group">
          <label class="form-label">Format</label>
          <select class="form-input" name="format">
            <option value="csv">CSV</option>
            <option value="xlsx">Excel</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Date Range</label>
          <select class="form-input" name="dateRange">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="custom">Custom range</option>
          </select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button class="btn btn-primary" data-action="export">Export</button>
        </div>
      </div>
    `);
    
    this.showModal(modal);
  }

  showSettings() {
    const modal = this.createModal('settings-modal', 'Settings', `
      <div class="modal-form">
        <div class="form-group">
          <label class="form-label">Theme</label>
          <select class="form-input" name="theme">
            <option value="dark" selected>Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Refresh Interval</label>
          <select class="form-input" name="refreshInterval">
            <option value="30">30 seconds</option>
            <option value="60" selected>1 minute</option>
            <option value="300">5 minutes</option>
            <option value="0">Manual</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">
            <input type="checkbox" name="notifications" checked> 
            Show notifications
          </label>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" data-action="cancel">Cancel</button>
          <button class="btn btn-primary" data-action="save">Save Settings</button>
        </div>
      </div>
    `);
    
    this.showModal(modal);
  }

  createModal(id, title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal" role="dialog" aria-labelledby="${id}-title">
        <div class="modal-header">
          <h3 id="${id}-title" class="modal-title">${title}</h3>
          <button class="modal-close" aria-label="Close modal">×</button>
        </div>
        <div class="modal-content">
          ${content}
        </div>
      </div>
    `;
    
    // Event handlers
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('[data-action="cancel"]');
    
    closeBtn?.addEventListener('click', () => this.hideModal(modal));
    cancelBtn?.addEventListener('click', () => this.hideModal(modal));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.hideModal(modal);
    });
    
    // Action buttons
    const actionBtns = modal.querySelectorAll('[data-action]:not([data-action="cancel"])');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.handleModalAction(modal, action);
      });
    });
    
    this.modals.set(id, modal);
    return modal;
  }

  showModal(modal) {
    document.body.appendChild(modal);
    requestAnimationFrame(() => {
      modal.classList.add('show');
    });
    
    // Focus management
    const firstInput = modal.querySelector('input, select, button');
    firstInput?.focus();
  }

  hideModal(modal) {
    modal.classList.add('hiding');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }

  handleModalAction(modal, action) {
    const formData = new FormData(modal.querySelector('.modal-form'));
    const data = Object.fromEntries(formData.entries());
    
    this.dispatchEvent(`modal:${action}`, { data });
    this.hideModal(modal);
  }

  // Utility functions
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Event system
  addEventListeners(element, event, handler) {
    if (!element) return;
    
    element.addEventListener(event, handler);
    
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element).push({ event, handler });
  }

  dispatchEvent(eventName, data = {}) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  }

  // Keyboard shortcuts
  setupKeyboardShortcuts() {
    this.addEventListeners(document, 'keydown', (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.elements.searchInput?.focus();
      }
      
      // Ctrl/Cmd + R for refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        this.handleRefresh(e);
      }
    });
  }

  handleKeyDown(event) {
    if (event.key === 'Escape') {
      this.closeMobilePanels();
      
      // Close any open modals
      document.querySelectorAll('.modal-overlay.show').forEach(modal => {
        this.hideModal(modal);
      });
    }
  }

  // Responsive handling
  handleResize() {
    this.checkViewport();
    this.dispatchEvent('viewport:resize', { 
      width: window.innerWidth, 
      height: window.innerHeight 
    });
  }

  checkViewport() {
    const width = window.innerWidth;
    
    // Close panels on desktop
    if (width > 991) {
      this.closeMobilePanels();
    }

    // Normalize right panel class across breakpoints
    if (width >= 1200) {
      // Desktop: rely on 'collapsed' to control width
      this.elements.rightPanel.classList.remove('open');
      this.elements.rightPanel.classList.toggle('collapsed', !this.state.rightPanelOpen);
    }
    
    // Update body class for responsive styling
    document.body.classList.toggle('mobile', width <= 767);
    document.body.classList.toggle('tablet', width > 767 && width <= 991);
    document.body.classList.toggle('desktop', width > 991);
  }

  // Tooltips
  initializeTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
      element.addEventListener('mouseenter', this.showTooltip.bind(this));
      element.addEventListener('mouseleave', this.hideTooltip.bind(this));
    });
  }

  showTooltip(event) {
    // Tooltip implementation would go here
    // For brevity, using title attribute fallback
    const element = event.currentTarget;
    const text = element.dataset.tooltip;
    if (text && !element.title) {
      element.title = text;
    }
  }

  hideTooltip(event) {
    // Clean up tooltip
  }

  // Dropdowns
  initializeDropdowns() {
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
      this.addEventListeners(toggle, 'click', this.toggleDropdown.bind(this));
    });
    
    // Close dropdowns when clicking outside
    this.addEventListeners(document, 'click', (e) => {
      if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown.open').forEach(dropdown => {
          dropdown.classList.remove('open');
        });
      }
    });
  }

  toggleDropdown(event) {
    event.stopPropagation();
    const dropdown = event.currentTarget.closest('.dropdown');
    dropdown.classList.toggle('open');
  }

  // Cleanup
  handleBeforeUnload() {
    this.destroy();
  }

  destroy() {
    // Remove all event listeners
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    
    this.eventListeners.clear();
    
    // Clear timers and cleanup
    this.modals.forEach(modal => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    });
    
    this.modals.clear();
    this.notifications = [];
    
    console.log('🎨 UI destroyed and cleaned up');
  }

  // Get current state
  getState() {
    return { ...this.state };
  }

  // Update state
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.dispatchEvent('state:update', { state: this.state });
  }
}

// Export for ES6 modules
export default DashboardUI;
