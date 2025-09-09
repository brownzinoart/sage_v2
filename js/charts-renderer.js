/**
 * Copyright (c) 2025-2026 One Block Away LLC
 * All rights reserved. Proprietary and confidential.
 * 
 * Charts Renderer - Handles all chart visualizations using Chart.js
 */

class SageChartsRenderer {
  constructor() {
    this.charts = new Map();
    
    // Ultra-premium color palette
    this.colors = {
      primary: '#6366f1',
      primaryGlow: 'rgba(99, 102, 241, 0.6)',
      secondary: '#8b5cf6',
      secondaryGlow: 'rgba(139, 92, 246, 0.6)',
      success: '#10b981',
      successGlow: 'rgba(16, 185, 129, 0.6)',
      warning: '#f59e0b',
      warningGlow: 'rgba(245, 158, 11, 0.6)',
      danger: '#ef4444',
      sage: '#22c55e',
      sageGlow: 'rgba(34, 197, 94, 0.6)',
      direct: '#64748b',
      directGlow: 'rgba(100, 116, 139, 0.6)',
      accent: '#fbbf24',
      accentGlow: 'rgba(251, 191, 36, 0.6)'
    };
    
    // Ultra-premium Chart.js configuration
    this.defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      elements: {
        point: {
          hoverRadius: 12,
          hoverBorderWidth: 3,
          radius: 6,
          borderWidth: 2,
        },
        line: {
          tension: 0.4,
          borderWidth: 3,
        },
        bar: {
          borderRadius: 8,
          borderSkipped: false,
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(255, 255, 255, 0.9)',
            font: {
              family: '"Poppins", sans-serif',
              size: 13,
              weight: '500'
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            boxWidth: 8,
            boxHeight: 8,
            filter: function(legendItem, chartData) {
              return legendItem.text !== 'hidden';
            }
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(15, 15, 15, 0.95)',
          titleColor: '#ffffff',
          bodyColor: '#f0f0f0',
          footerColor: 'rgba(255, 255, 255, 0.7)',
          borderColor: 'rgba(99, 102, 241, 0.5)',
          borderWidth: 1,
          cornerRadius: 12,
          displayColors: true,
          padding: 16,
          titleFont: {
            family: '"Poppins", sans-serif',
            size: 14,
            weight: '600'
          },
          bodyFont: {
            family: '"Inter", sans-serif',
            size: 13,
            weight: '500'
          },
          footerFont: {
            family: '"Inter", sans-serif',
            size: 12,
            weight: '400'
          },
          caretSize: 8,
          caretPadding: 12,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.2)',
          animation: {
            duration: 300,
            easing: 'easeOutCubic'
          },
          external: this.customTooltip.bind(this)
        }
      },
      scales: {
        x: {
          border: {
            display: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            font: {
              family: '"Inter", sans-serif',
              size: 12,
              weight: '500'
            },
            padding: 12,
            maxRotation: 0,
            callback: function(value, index, ticks) {
              return this.getLabelForValue(value);
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.08)',
            lineWidth: 1,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [2, 4]
          }
        },
        y: {
          border: {
            display: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            font: {
              family: '"Inter", sans-serif',
              size: 12,
              weight: '500'
            },
            padding: 16,
            count: 6
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.08)',
            lineWidth: 1,
            drawBorder: false,
            borderDash: [2, 4]
          }
        }
      },
      animation: {
        duration: 1200,
        easing: 'easeOutCubic',
        delay: (context) => {
          return context.type === 'data' && context.mode === 'default' 
            ? context.dataIndex * 100 
            : 0;
        }
      },
      transitions: {
        active: {
          animation: {
            duration: 300
          }
        }
      }
    };
  }

  /**
   * Custom tooltip with premium styling
   */
  customTooltip(context) {
    // Custom tooltip implementation for ultra-premium look
    const { chart, tooltip } = context;
    
    if (tooltip.opacity === 0) {
      const tooltipEl = chart.canvas.parentNode.querySelector('.chartjs-tooltip');
      if (tooltipEl) {
        tooltipEl.style.opacity = '0';
      }
      return;
    }

    // Create or update custom tooltip element
    let tooltipEl = chart.canvas.parentNode.querySelector('.chartjs-tooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'chartjs-tooltip';
      tooltipEl.innerHTML = '<div class="tooltip-content"></div>';
      chart.canvas.parentNode.appendChild(tooltipEl);

      // Add premium tooltip styles
      const style = document.createElement('style');
      style.textContent = `
        .chartjs-tooltip {
          position: absolute;
          pointer-events: none;
          background: linear-gradient(135deg, rgba(15, 15, 15, 0.95), rgba(26, 26, 26, 0.95));
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          padding: 16px;
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 20px rgba(99, 102, 241, 0.2),
            0 1px 0 rgba(255, 255, 255, 0.1) inset;
          backdrop-filter: blur(20px) saturate(180%);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          font-family: "Inter", sans-serif;
        }
        
        .tooltip-content {
          color: #ffffff;
          line-height: 1.5;
        }
      `;
      document.head.appendChild(style);
    }

    // Position tooltip
    // Position relative to canvas without relying on Chart.helpers (version agnostic)
    const rect = chart.canvas.getBoundingClientRect();
    tooltipEl.style.left = (rect.left + window.pageXOffset + tooltip.caretX) + 'px';
    tooltipEl.style.top = (rect.top + window.pageYOffset + tooltip.caretY) + 'px';
    tooltipEl.style.opacity = '1';
  }

  createRevenueChart(canvasId, revenueHistory) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`Canvas ${canvasId} not found`);
      return null;
    }
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded; skipping revenue chart');
      return null;
    }

    const ctx = canvas.getContext('2d');
    
    // Prepare data
    const labels = revenueHistory.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const sageData = revenueHistory.map(day => day.sageRevenue);
    const directData = revenueHistory.map(day => day.directRevenue);
    const totalData = revenueHistory.map(day => day.totalRevenue);

    const config = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Sage Revenue',
            data: sageData,
            borderColor: this.colors.sage,
            backgroundColor: this.createPremiumGradient(ctx, this.colors.sage, this.colors.sageGlow),
            fill: true,
            tension: 0.4,
            borderWidth: 4,
            pointBackgroundColor: this.colors.sage,
            pointBorderColor: 'rgba(255, 255, 255, 0.9)',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 10,
            pointHoverBorderWidth: 4,
            pointHoverBackgroundColor: this.colors.sage,
            pointHoverBorderColor: '#ffffff',
            shadowOffsetX: 0,
            shadowOffsetY: 4,
            shadowBlur: 12,
            shadowColor: this.colors.sageGlow
          },
          {
            label: 'Direct Revenue', 
            data: directData,
            borderColor: this.colors.direct,
            backgroundColor: this.createPremiumGradient(ctx, this.colors.direct, this.colors.directGlow),
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: this.colors.direct,
            pointBorderColor: 'rgba(255, 255, 255, 0.8)',
            pointBorderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 9,
            pointHoverBorderWidth: 4,
            pointHoverBackgroundColor: this.colors.direct,
            pointHoverBorderColor: '#ffffff'
          },
          {
            label: 'Total Revenue',
            data: totalData,
            borderColor: this.colors.accent,
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.4,
            borderWidth: 4,
            pointBackgroundColor: this.colors.accent,
            pointBorderColor: 'rgba(255, 255, 255, 0.9)',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 11,
            pointHoverBorderWidth: 4,
            pointHoverBackgroundColor: this.colors.accent,
            pointHoverBorderColor: '#ffffff',
            borderDash: [8, 6],
            lineDashOffset: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 2,
            shadowBlur: 8,
            shadowColor: this.colors.accentGlow
          }
        ]
      },
      options: {
        ...this.defaultOptions,
        plugins: {
          ...this.defaultOptions.plugins,
          tooltip: {
            ...this.defaultOptions.plugins.tooltip,
            callbacks: {
              title: (tooltipItems) => {
                const index = tooltipItems[0].dataIndex;
                const date = new Date(revenueHistory[index].date);
                return date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });
              },
              label: (context) => {
                const value = context.parsed.y;
                return `${context.dataset.label}: $${value.toLocaleString()}`;
              },
              afterLabel: (context) => {
                if (context.datasetIndex === 0) { // Sage revenue
                  const index = context.dataIndex;
                  const transactions = revenueHistory[index].transactions;
                  const users = revenueHistory[index].users;
                  return [`Transactions: ${transactions}`, `Users: ${users}`];
                }
                return null;
              }
            }
          }
        },
        scales: {
          ...this.defaultOptions.scales,
          y: {
            ...this.defaultOptions.scales.y,
            beginAtZero: true,
            ticks: {
              ...this.defaultOptions.scales.y.ticks,
              callback: (value) => '$' + value.toLocaleString()
            }
          }
        }
      }
    };

    // Destroy existing chart if it exists
    if (this.charts.has(canvasId)) {
      this.charts.get(canvasId).destroy();
    }

    const chart = new Chart(ctx, config);
    this.charts.set(canvasId, chart);
    return chart;
  }

  createExperienceChart(canvasId, experienceData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded; skipping experience chart');
      return null;
    }

    const ctx = canvas.getContext('2d');
    
    const config = {
      type: 'doughnut',
      data: {
        labels: Object.keys(experienceData),
        datasets: [{
          data: Object.values(experienceData),
          backgroundColor: [
            this.colors.warning,  // New
            this.colors.primary,  // Casual
            this.colors.success   // Experienced
          ],
          borderColor: 'rgba(15, 15, 15, 0.8)',
          borderWidth: 3,
          hoverBorderWidth: 4,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(255, 255, 255, 0.8)',
              padding: 15,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            ...this.defaultOptions.plugins.tooltip,
            callbacks: {
              label: (context) => {
                const label = context.label;
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} users (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    if (this.charts.has(canvasId)) {
      this.charts.get(canvasId).destroy();
    }

    const chart = new Chart(ctx, config);
    this.charts.set(canvasId, chart);
    return chart;
  }

  createCategoryChart(canvasId, categoryData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded; skipping category chart');
      return null;
    }

    const ctx = canvas.getContext('2d');
    
    // Sort categories by value for better visualization
    const sortedEntries = Object.entries(categoryData)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6); // Show top 6 categories

    const config = {
      type: 'bar',
      data: {
        labels: sortedEntries.map(([label]) => label),
        datasets: [{
          data: sortedEntries.map(([, value]) => value),
          backgroundColor: this.colors.primary,
          borderColor: this.colors.secondary,
          borderWidth: 1,
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            ...this.defaultOptions.plugins.tooltip,
            callbacks: {
              label: (context) => {
                return `${context.parsed.x} queries`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              maxRotation: 0,
              font: {
                size: 11
              }
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    if (this.charts.has(canvasId)) {
      this.charts.get(canvasId).destroy();
    }

    const chart = new Chart(ctx, config);
    this.charts.set(canvasId, chart);
    return chart;
  }

  createComparisonChart(canvasId, revenueHistory) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded; skipping comparison chart');
      return null;
    }

    const ctx = canvas.getContext('2d');
    
    // Aggregate data by week for comparison
    const weeklyData = this.aggregateWeeklyData(revenueHistory);
    
    const config = {
      type: 'bar',
      data: {
        labels: weeklyData.labels,
        datasets: [
          {
            label: 'Sage Revenue',
            data: weeklyData.sageRevenue,
            backgroundColor: this.colors.sage,
            borderRadius: 6,
            borderSkipped: false
          },
          {
            label: 'Direct Revenue',
            data: weeklyData.directRevenue,
            backgroundColor: this.colors.direct,
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      },
      options: {
        ...this.defaultOptions,
        plugins: {
          ...this.defaultOptions.plugins,
          tooltip: {
            ...this.defaultOptions.plugins.tooltip,
            callbacks: {
              label: (context) => {
                return `${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
              },
              footer: (tooltipItems) => {
                const sageValue = tooltipItems.find(item => item.dataset.label === 'Sage Revenue')?.parsed.y || 0;
                const directValue = tooltipItems.find(item => item.dataset.label === 'Direct Revenue')?.parsed.y || 0;
                const total = sageValue + directValue;
                const sagePercentage = total > 0 ? ((sageValue / total) * 100).toFixed(1) : 0;
                return `Sage: ${sagePercentage}% of total revenue`;
              }
            }
          }
        },
        scales: {
          ...this.defaultOptions.scales,
          x: {
            ...this.defaultOptions.scales.x,
            stacked: true
          },
          y: {
            ...this.defaultOptions.scales.y,
            stacked: true,
            beginAtZero: true,
            ticks: {
              ...this.defaultOptions.scales.y.ticks,
              callback: (value) => '$' + (value / 1000).toFixed(0) + 'K'
            }
          }
        }
      }
    };

    if (this.charts.has(canvasId)) {
      this.charts.get(canvasId).destroy();
    }

    const chart = new Chart(ctx, config);
    this.charts.set(canvasId, chart);
    return chart;
  }

  updateRevenueChart(canvasId, newData, timeRange) {
    const chart = this.charts.get(canvasId);
    if (!chart) return;

    // Update data based on time range
    let filteredData = newData;
    let labelFormat = { month: 'short', day: 'numeric' };

    switch (timeRange) {
      case 'week':
        filteredData = newData.slice(-7);
        labelFormat = { weekday: 'short', day: 'numeric' };
        break;
      case 'month':
        filteredData = newData.slice(-30);
        break;
      case 'today':
        // For today, show hourly data instead
        filteredData = this.generateHourlyData();
        labelFormat = { hour: 'numeric', minute: '2-digit' };
        break;
    }

    const labels = filteredData.map(day => {
      const date = new Date(day.date || day.hour);
      return date.toLocaleDateString('en-US', labelFormat);
    });

    chart.data.labels = labels;
    chart.data.datasets[0].data = filteredData.map(day => day.sageRevenue);
    chart.data.datasets[1].data = filteredData.map(day => day.directRevenue);
    chart.data.datasets[2].data = filteredData.map(day => day.totalRevenue);

    chart.update('active');
  }

  updateChartView(view) {
    // Update all charts based on view (daily, weekly, monthly)
    const revenueChart = this.charts.get('revenue-chart');
    if (revenueChart) {
      // Implementation for different views would go here
      console.log(`Updating charts to ${view} view`);
    }
  }

  // Helper methods for premium gradients
  // Create a CSS rgba() string with specific alpha from hex/rgb/rgba input
  toRgba(color, alpha) {
    try {
      if (!color) return `rgba(0,0,0,${alpha})`;
      const c = color.trim();
      // rgba(...) → replace alpha
      if (c.startsWith('rgba(')) {
        const parts = c.substring(5, c.length - 1).split(',').map(s => s.trim());
        const [r, g, b] = parts;
        return `rgba(${parseInt(r)}, ${parseInt(g)}, ${parseInt(b)}, ${alpha})`;
      }
      // rgb(...) → add alpha
      if (c.startsWith('rgb(')) {
        const parts = c.substring(4, c.length - 1).split(',').map(s => s.trim());
        const [r, g, b] = parts;
        return `rgba(${parseInt(r)}, ${parseInt(g)}, ${parseInt(b)}, ${alpha})`;
      }
      // #RRGGBB or #RGB
      if (c.startsWith('#')) {
        let hex = c.slice(1);
        if (hex.length === 3) {
          hex = hex.split('').map(ch => ch + ch).join('');
        }
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
      // Fallback: assume named color, wrap into rgba via canvas API if needed
      return `rgba(0,0,0,${alpha})`;
    } catch (_) {
      return `rgba(0,0,0,${alpha})`;
    }
  }

  createGradient(ctx, color) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, this.toRgba(color, 0.25)); // 25% opacity
    gradient.addColorStop(1, this.toRgba(color, 0.0));  // 0% opacity
    return gradient;
  }

  createPremiumGradient(ctx, primaryColor, glowColor) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, this.toRgba(primaryColor, 0.38));
    gradient.addColorStop(0.3, this.toRgba(primaryColor, 0.19));
    gradient.addColorStop(0.7, this.toRgba(glowColor, 0.12));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.02)'); // Nearly transparent
    return gradient;
  }

  createRadialGradient(ctx, centerX, centerY, radius, primaryColor, glowColor) {
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, this.toRgba(primaryColor, 0.5));
    gradient.addColorStop(0.5, this.toRgba(glowColor, 0.25));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent at edges
    return gradient;
  }

  createGlowEffect(chart, color) {
    const ctx = chart.ctx;
    const canvas = chart.canvas;
    
    // Create a temporary canvas for the glow effect
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = canvas.width;
    glowCanvas.height = canvas.height;
    const glowCtx = glowCanvas.getContext('2d');
    
    // Apply glow effect
    glowCtx.shadowColor = color;
    glowCtx.shadowBlur = 20;
    glowCtx.globalCompositeOperation = 'source-over';
    
    return glowCtx;
  }

  aggregateWeeklyData(dailyData) {
    const weeks = {};
    
    dailyData.forEach(day => {
      const date = new Date(day.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          sageRevenue: 0,
          directRevenue: 0,
          label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
      }
      
      weeks[weekKey].sageRevenue += day.sageRevenue;
      weeks[weekKey].directRevenue += day.directRevenue;
    });

    const sortedWeeks = Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-4); // Last 4 weeks

    return {
      labels: sortedWeeks.map(([, week]) => `Week of ${week.label}`),
      sageRevenue: sortedWeeks.map(([, week]) => week.sageRevenue),
      directRevenue: sortedWeeks.map(([, week]) => week.directRevenue)
    };
  }

  generateHourlyData() {
    // Generate hourly data for today view
    const hourlyData = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now);
      hour.setHours(hour.getHours() - i, 0, 0, 0);
      
      // Simulate hourly revenue with realistic patterns
      const baseRevenue = this.getHourlyBaseRevenue(hour.getHours());
      const variation = 0.7 + Math.random() * 0.6;
      const totalRevenue = Math.round(baseRevenue * variation);
      const sageRevenue = Math.round(totalRevenue * (0.15 + Math.random() * 0.1));
      
      hourlyData.push({
        hour: hour.toISOString(),
        date: hour.toISOString(),
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
    // Realistic hourly revenue patterns
    if (hour >= 9 && hour <= 11) return 180; // Morning peak
    if (hour >= 17 && hour <= 21) return 250; // Evening peak
    if (hour >= 14 && hour <= 16) return 120; // Afternoon
    if (hour >= 22 || hour <= 1) return 80;   // Late night
    return 40; // Off hours
  }

  // Animation utilities
  animateChart(chartId, delay = 0) {
    const chart = this.charts.get(chartId);
    if (!chart) return;

    setTimeout(() => {
      chart.update('show');
    }, delay);
  }

  // Cleanup
  destroy() {
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }

  destroyChart(canvasId) {
    const chart = this.charts.get(canvasId);
    if (chart) {
      chart.destroy();
      this.charts.delete(canvasId);
    }
  }

  // Resize handling
  handleResize() {
    this.charts.forEach(chart => {
      chart.resize();
    });
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.SageChartsRenderer = SageChartsRenderer;
  
  // Handle window resize for all charts
  window.addEventListener('resize', () => {
    if (window.chartsRenderer) {
      window.chartsRenderer.handleResize();
    }
  });
}
