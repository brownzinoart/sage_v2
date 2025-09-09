/**
 * Premium Dashboard Interactions
 * Ultra-sophisticated micro-interactions and animations for B2B SaaS experience
 */

class PremiumDashboardInteractions {
  constructor() {
    this.init();
    this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.mouse = { x: 0, y: 0 };
    this.animationFrameId = null;
  }

  init() {
    this.setupCustomCursor();
    this.setupMagneticEffects();
    this.setupNumberAnimations();
    this.setupScrollAnimations();
    this.setupActivityFeedAnimations();
    this.setupMetricCardInteractions();
    this.setupPremiumLoadingStates();
  }

  /**
   * Custom cursor with premium trail effect
   */
  setupCustomCursor() {
    if (this.isTouch) return;

    let cursor = document.querySelector('.custom-cursor');
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.className = 'custom-cursor';
      document.body.appendChild(cursor);
    }

    let cursorTrail = document.querySelector('.cursor-trail');
    if (!cursorTrail) {
      cursorTrail = document.createElement('div');
      cursorTrail.className = 'cursor-trail';
      document.body.appendChild(cursorTrail);
    }

    // Add premium cursor styles
    const style = document.createElement('style');
    style.textContent = `
      .custom-cursor {
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(99, 102, 241, 0.8);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(2px);
      }
      
      .cursor-trail {
        position: fixed;
        width: 8px;
        height: 8px;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.6), transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .custom-cursor.hover {
        width: 40px;
        height: 40px;
        border-color: rgba(99, 102, 241, 1);
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
      }
      
      .cursor-trail.hover {
        width: 16px;
        height: 16px;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.8), transparent);
      }
    `;
    document.head.appendChild(style);

    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      
      cursor.style.left = `${e.clientX - 10}px`;
      cursor.style.top = `${e.clientY - 10}px`;
      
      // Trail follows with delay
      setTimeout(() => {
        cursorTrail.style.left = `${e.clientX - 4}px`;
        cursorTrail.style.top = `${e.clientY - 4}px`;
      }, 100);
    });

    // Enhanced hover states for interactive elements
    const hoverElements = document.querySelectorAll(`
      .metric-card, .insight-card, .chart-btn, .export-btn, 
      .view-all-btn, .sage-logo, .range-btn
    `);
    
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        cursorTrail.classList.add('hover');
      });
      
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        cursorTrail.classList.remove('hover');
      });
    });
  }

  /**
   * Magnetic hover effects for metric cards
   */
  setupMagneticEffects() {
    if (this.isTouch) return;

    const magneticCards = document.querySelectorAll('.metric-card');
    
    magneticCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Calculate magnetic pull strength
        const strength = 0.15;
        const moveX = x * strength;
        const moveY = y * strength;
        
        // Apply magnetic transformation
        card.style.transform = `
          translateY(-8px) 
          scale(1.02) 
          rotateX(${-y * 0.05}deg) 
          rotateY(${x * 0.05}deg)
          translate3d(${moveX}px, ${moveY}px, 0)
        `;
        
        // Update CSS custom property for radial gradient effect
        card.style.setProperty('--mouse-x', `${(x + rect.width / 2) / rect.width * 100}%`);
        card.style.setProperty('--mouse-y', `${(y + rect.height / 2) / rect.height * 100}%`);
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.removeProperty('--mouse-x');
        card.style.removeProperty('--mouse-y');
      });
    });
  }

  /**
   * Premium number counting animations
   */
  setupNumberAnimations() {
    const animateNumber = (element, target, duration = 2000, prefix = '', suffix = '') => {
      const start = 0;
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.round(start + (target - start) * easeOutExpo);
        
        element.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    };

    // Animate revenue numbers on load
    setTimeout(() => {
      const revenueElement = document.getElementById('revenue-value');
      if (revenueElement) {
        animateNumber(revenueElement, 18293, 3000);
      }
      
      const usersElement = document.getElementById('users-value');
      if (usersElement) {
        animateNumber(usersElement, 1247, 2500);
      }
      
      const conversionElement = document.getElementById('conversion-value');
      if (conversionElement) {
        animateNumber(conversionElement, 23, 2000, '', '%');
      }
      
      const aovElement = document.getElementById('aov-value');
      if (aovElement) {
        animateNumber(aovElement, 89, 2200);
      }
    }, 500);
  }

  /**
   * Smooth scroll-driven animations
   */
  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px'
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Animate cards on scroll
    const cards = document.querySelectorAll(`
      .chart-card, .analytics-card, .comparison-card, 
      .funnel-card, .insight-card
    `);
    
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
      animateOnScroll.observe(card);
    });
  }

  /**
   * Activity feed with kinetic animations
   */
  setupActivityFeedAnimations() {
    const activityFeed = document.getElementById('activity-feed');
    if (!activityFeed) return;

    // Simulate real-time activity
    const activities = [
      { icon: '💰', text: 'New sale: $127.50 from Blue Dream recommendation', time: 'Just now' },
      { icon: '👤', text: 'User asked about sleep aids - recommended Granddaddy Purple', time: '2m ago' },
      { icon: '📊', text: 'Conversion rate up 3.2% from yesterday', time: '5m ago' },
      { icon: '🌟', text: 'Product spotlight: Wedding Cake gaining popularity', time: '8m ago' },
      { icon: '🔥', text: 'Hot streak: 5 sales in the last 15 minutes', time: '12m ago' }
    ];

    let activityIndex = 0;

    const addActivity = () => {
      if (activityFeed.children.length >= 5) {
        const oldest = activityFeed.lastElementChild;
        oldest.style.transform = 'translateX(100%) scale(0.8)';
        oldest.style.opacity = '0';
        setTimeout(() => oldest.remove(), 300);
      }

      const activity = activities[activityIndex % activities.length];
      const activityEl = document.createElement('div');
      activityEl.className = 'activity-item';
      activityEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 18px; filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4));">
            ${activity.icon}
          </span>
          <div style="flex: 1;">
            <div style="color: var(--color-fg); font-weight: 500; font-size: 14px; line-height: 1.4;">
              ${activity.text}
            </div>
            <div style="color: var(--color-subtle); font-size: 12px; font-weight: 500;">
              ${activity.time}
            </div>
          </div>
        </div>
      `;

      // Add with animation
      activityEl.style.transform = 'translateX(-100%) scale(0.8)';
      activityEl.style.opacity = '0';
      activityFeed.insertBefore(activityEl, activityFeed.firstChild);

      // Animate in
      requestAnimationFrame(() => {
        activityEl.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        activityEl.style.transform = 'translateX(0) scale(1)';
        activityEl.style.opacity = '1';
      });

      activityIndex++;
    };

    // Add initial activities
    activities.forEach((_, index) => {
      setTimeout(() => addActivity(), index * 200);
    });

    // Continue adding activities
    setInterval(addActivity, 8000 + Math.random() * 4000);
  }

  /**
   * Enhanced metric card interactions
   */
  setupMetricCardInteractions() {
    const metricCards = document.querySelectorAll('.metric-card');
    
    metricCards.forEach(card => {
      // Tilt effect on hover
      card.addEventListener('mouseenter', () => {
        card.style.transformStyle = 'preserve-3d';
        card.style.willChange = 'transform';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.willChange = 'auto';
      });

      // Click ripple effect
      card.addEventListener('click', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.6), transparent);
          border-radius: 50%;
          pointer-events: none;
          left: ${x}px;
          top: ${y}px;
          transform: translate(-50%, -50%) scale(0);
          animation: ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        `;
        
        card.style.position = 'relative';
        card.appendChild(ripple);
        
        // Add ripple animation
        const rippleStyle = document.createElement('style');
        rippleStyle.textContent = `
          @keyframes ripple {
            to {
              transform: translate(-50%, -50%) scale(40);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(rippleStyle);
        
        setTimeout(() => {
          ripple.remove();
          rippleStyle.remove();
        }, 600);
      });
    });
  }

  /**
   * Premium loading states and transitions
   */
  setupPremiumLoadingStates() {
    // Staggered card entrance animation
    const allCards = document.querySelectorAll(`
      .metric-card, .chart-card, .analytics-card, 
      .insight-card, .activity-sidebar, .insights-sidebar
    `);
    
    allCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px) scale(0.95)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
      }, index * 100 + 300);
    });

    // Premium skeleton loading for charts
    this.addChartSkeletonLoading();
  }

  /**
   * Chart skeleton loading animation
   */
  addChartSkeletonLoading() {
    const chartContainers = document.querySelectorAll('.chart-container, .chart-small');
    
    const skeletonStyle = document.createElement('style');
    skeletonStyle.textContent = `
      .chart-skeleton {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.04) 0%,
          rgba(255, 255, 255, 0.08) 50%,
          rgba(255, 255, 255, 0.04) 100%
        );
        background-size: 200% 100%;
        animation: shimmer 2s ease-in-out infinite;
        border-radius: var(--radius-md);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .chart-skeleton.active {
        opacity: 1;
      }
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(skeletonStyle);
    
    chartContainers.forEach(container => {
      const skeleton = document.createElement('div');
      skeleton.className = 'chart-skeleton';
      container.appendChild(skeleton);
      
      // Show skeleton briefly on load
      setTimeout(() => skeleton.classList.add('active'), 200);
      setTimeout(() => {
        skeleton.classList.remove('active');
        setTimeout(() => skeleton.remove(), 300);
      }, 2000);
    });
  }
}

// Initialize premium interactions when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PremiumDashboardInteractions();
  });
} else {
  new PremiumDashboardInteractions();
}

// Export for potential external use
window.PremiumDashboardInteractions = PremiumDashboardInteractions;