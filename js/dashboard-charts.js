// Dashboard Charts Module - Chart.js Integration and Management
class DashboardCharts {
  constructor() {
    this.charts = {};
    this.chartConfigs = {};
    this.colorPalette = {
      primary: 'rgb(129, 140, 248)',
      primaryLight: 'rgba(129, 140, 248, 0.1)',
      success: 'rgb(52, 211, 153)',
      successLight: 'rgba(52, 211, 153, 0.1)',
      warning: 'rgb(251, 191, 36)',
      warningLight: 'rgba(251, 191, 36, 0.1)',
      error: 'rgb(248, 113, 113)',
      errorLight: 'rgba(248, 113, 113, 0.1)',
      neutral: 'rgb(148, 163, 184)',
      neutralLight: 'rgba(148, 163, 184, 0.1)'
    };
  }

  // Initialize all charts
  async init(data) {
    try {
      await this.loadChartJS();
      this.setupChartDefaults();
      
      // Create all charts
      await this.createRevenueChart(data.revenue);
      await this.createConversionChart(data.conversion);
      await this.createTrafficChart(data.traffic);
      await this.createSalesChart(data.sales);
      await this.createPerformanceChart(data.performance);
      // Heatmap removed from UI
      
      console.log('📊 All charts initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize charts:', error);
      return false;
    }
  }

  // Load Chart.js library
  async loadChartJS() {
    if (window.Chart) return;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Setup Chart.js defaults
  setupChartDefaults() {
    const d = Chart.defaults;
    d.font = d.font || {};
    d.font.family = '"Inter", system-ui, sans-serif';
    d.font.size = 12;
    d.color = '#94A3B8';
    d.backgroundColor = 'rgba(129, 140, 248, 0.1)';
    d.borderColor = 'rgba(30, 41, 59, 0.1)';
    d.plugins = d.plugins || {};
    d.plugins.legend = d.plugins.legend || {};
    d.plugins.legend.display = false;
    d.responsive = true;
    d.maintainAspectRatio = false;
    d.scales = d.scales || {};
    d.scales.x = d.scales.x || {};
    d.scales.y = d.scales.y || {};
    d.scales.x.grid = d.scales.x.grid || {};
    d.scales.y.grid = d.scales.y.grid || {};
    d.scales.x.grid.display = false;
    d.scales.y.grid.color = 'rgba(30, 41, 59, 0.1)';
  }

  // Create Revenue Trend Chart
  async createRevenueChart(data) {
    const canvas = document.getElementById('revenue-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    this.charts.revenue = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Revenue',
          data: data.values,
          borderColor: this.colorPalette.primary,
          backgroundColor: this.colorPalette.primaryLight,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 8,
          pointBackgroundColor: this.colorPalette.primary,
          pointBorderColor: '#1E293B',
          pointBorderWidth: 3
        }]
      },
      options: {
        plugins: {
          tooltip: {
            backgroundColor: '#1E293B',
            titleColor: '#F1F5F9',
            bodyColor: '#F1F5F9',
            borderColor: this.colorPalette.primary,
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (context) => `$${context.parsed.y.toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `$${value / 1000}k`
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  // Create a minimal sparkline for KPI cards
  createSparkline(canvasId, sparkData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === 'undefined') return;
    const ctx = canvas.getContext('2d');
    const values = Array.isArray(sparkData)
      ? sparkData.map(d => (typeof d === 'number' ? d : d.value))
      : [];
    // Destroy existing if any
    if (this.charts[canvasId]) {
      try { this.charts[canvasId].destroy(); } catch (_) {}
    }
    this.charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: values.map((_, i) => i + 1),
        datasets: [{
          data: values,
          borderColor: this.colorPalette.primary,
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } }
      }
    });
  }

  // Create Conversion Funnel Chart
  async createConversionChart(data) {
    const canvas = document.getElementById('conversion-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    this.charts.conversion = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: [
            this.colorPalette.primary,
            this.colorPalette.success,
            this.colorPalette.warning,
            this.colorPalette.error
          ],
          borderWidth: 0,
          cutout: '70%'
        }]
      },
      options: {
        plugins: {
          tooltip: {
            backgroundColor: '#1E293B',
            titleColor: '#F1F5F9',
            bodyColor: '#F1F5F9',
            borderColor: this.colorPalette.primary,
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed}%`
            }
          }
        }
      }
    });
  }

  // Create Traffic Sources Chart
  async createTrafficChart(data) {
    const canvas = document.getElementById('traffic-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    this.charts.traffic = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Sessions',
          data: data.values,
          backgroundColor: [
            this.colorPalette.primary,
            this.colorPalette.success,
            this.colorPalette.warning,
            this.colorPalette.error,
            this.colorPalette.neutral
          ],
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: {
          tooltip: {
            backgroundColor: '#1E293B',
            titleColor: '#F1F5F9',
            bodyColor: '#F1F5F9',
            borderColor: this.colorPalette.primary,
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (context) => `${context.parsed.x.toLocaleString()} sessions`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `${value / 1000}k`
            }
          }
        }
      }
    });
  }

  // Create Sales Performance Chart
  async createSalesChart(data) {
    const canvas = document.getElementById('sales-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    this.charts.sales = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Sales',
            data: data.sales,
            backgroundColor: this.colorPalette.primary,
            borderRadius: 4,
            borderSkipped: false
          },
          {
            label: 'Target',
            data: data.targets,
            backgroundColor: this.colorPalette.success,
            borderRadius: 4,
            borderSkipped: false
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              usePointStyle: true,
              padding: 20,
              color: '#94A3B8'
            }
          },
          tooltip: {
            backgroundColor: '#1E293B',
            titleColor: '#F1F5F9',
            bodyColor: '#F1F5F9',
            borderColor: this.colorPalette.primary,
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: (context) => `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `$${value / 1000}k`
            }
          }
        }
      }
    });
  }

  // Create Performance Metrics Chart
  async createPerformanceChart(data) {
    const canvas = document.getElementById('performance-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    this.charts.performance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Current',
          data: data.current,
          borderColor: this.colorPalette.primary,
          backgroundColor: this.colorPalette.primaryLight,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: this.colorPalette.primary,
          pointBorderColor: '#1E293B',
          pointBorderWidth: 2
        }, {
          label: 'Previous',
          data: data.previous,
          borderColor: this.colorPalette.neutral,
          backgroundColor: this.colorPalette.neutralLight,
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: this.colorPalette.neutral,
          pointBorderColor: '#1E293B',
          pointBorderWidth: 2
        }]
      },
      options: {
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
              color: '#94A3B8'
            }
          },
          tooltip: {
            backgroundColor: '#1E293B',
            titleColor: '#F1F5F9',
            bodyColor: '#F1F5F9',
            borderColor: this.colorPalette.primary,
            borderWidth: 1,
            cornerRadius: 8,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.r}%`
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              callback: (value) => `${value}%`
            },
            grid: {
              color: 'rgba(30, 41, 59, 0.2)'
            },
            pointLabels: {
              color: '#94A3B8',
              font: {
                size: 11
              }
            }
          }
        }
      }
    });
  }

  // Heatmap removed from UI (method deleted)

  // Update charts with new data
  updateCharts(data) {
    Object.keys(this.charts).forEach(chartKey => {
      if (data[chartKey] && this.charts[chartKey]) {
        this.updateChart(chartKey, data[chartKey]);
      }
    });
  }

  // Update specific chart
  updateChart(chartKey, newData) {
    const chart = this.charts[chartKey];
    if (!chart) return;

    switch (chartKey) {
      case 'revenue':
        chart.data.datasets[0].data = newData.values;
        break;
      case 'conversion':
        chart.data.datasets[0].data = newData.values;
        break;
      case 'traffic':
        chart.data.datasets[0].data = newData.values;
        break;
      case 'sales':
        chart.data.datasets[0].data = newData.sales;
        chart.data.datasets[1].data = newData.targets;
        break;
      case 'performance':
        chart.data.datasets[0].data = newData.current;
        chart.data.datasets[1].data = newData.previous;
        break;
    }
    
    chart.update('none');
  }

  // Resize all charts
  resizeCharts() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.resize === 'function') {
        chart.resize();
      }
    });
  }

  // Destroy all charts
  destroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.charts = {};
    console.log('📊 All charts destroyed');
  }

  // Helper methods
  getDayName(dayIndex) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayIndex];
  }

  // Export chart as image
  exportChart(chartKey, filename = null) {
    const chart = this.charts[chartKey];
    if (!chart) return null;

    const canvas = chart.canvas;
    const url = canvas.toDataURL('image/png');
    
    if (filename) {
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
    }
    
    return url;
  }

  // Get chart status
  getStatus() {
    const status = {
      initialized: Object.keys(this.charts).length > 0,
      chartCount: Object.keys(this.charts).length,
      charts: {}
    };

    Object.keys(this.charts).forEach(key => {
      status.charts[key] = {
        active: !!this.charts[key],
        canvas: !!document.getElementById(`${key}-chart`)
      };
    });

    return status;
  }
}

// Export for ES6 modules
export default DashboardCharts;
