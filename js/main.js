/**
 * Main JavaScript file for Credicálidda website
 * Optimized for performance and maintainability
 */

// Main application class
class CredicaliddaApp {
    constructor() {
        this.isInitialized = false;
        this.components = new Map();
        this.eventListeners = new Map();
        this.init();
        // Expose namespace
        window.CredicAlidda = window.CredicAlidda || {};
    }
    
    init() {
        if (this.isInitialized) return;
        
        // Performance monitoring
        if (window.Utils && window.Utils.performance) {
            window.Utils.performance.mark('app-init-start');
        }
        
        // Load site settings (WhatsApp, etc.) ASAP
        this.loadSiteSettings();
        this.setupEventListeners();
        this.initializeComponents();
        this.handlePageLoad();
        
        this.isInitialized = true;
        
        // Performance monitoring
        if (window.Utils && window.Utils.performance) {
            window.Utils.performance.mark('app-init-end');
            window.Utils.performance.measure('app-initialization', 'app-init-start', 'app-init-end');
        }
    }

    async loadSiteSettings() {
        try {
            // Prefer JSON settings (public)
            let number = '';
            try {
                const rj = await fetch('/data/site-settings.json', { cache: 'no-store' });
                if (rj.ok) {
                    const j = await rj.json();
                    if (j && j.whatsapp) number = String(j.whatsapp);
                }
            } catch (_) { /* ignore */ }

            if (!number) {
                // Fallback to YAML
                try {
                    const ry = await fetch('/_config/general.yml', { cache: 'no-store' });
                    if (ry.ok) {
                        const text = await ry.text();
                        const m = text.match(/\bwhatsapp\s*:\s*(["']?)([^\r\n"']+)\1/);
                        if (m) number = m[2];
                    }
                } catch (_) { /* ignore */ }
            }

            if (number) {
                const digits = number.replace(/[^0-9]/g, '');
                window.CredicAlidda = Object.assign(window.CredicAlidda || {}, { whatsapp: digits });
            }
        } catch (e) {
            if (window.Utils && Utils.errorHandler) Utils.errorHandler.log(e, 'load_site_settings');
            else console.debug('[SiteSettings] load error', e);
        }
    }
    
    // Add missing methods
    reportPerformance() {
        try {
            if (window.performance) {
                const timing = window.performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);
                // Here you could send performance data to analytics
            }
        } catch (e) {
            Utils.errorHandler.log(e, 'performance_report');
        }
    }
    
    trackEvent(eventName, data = {}) {
        try {
            console.log(`Event: ${eventName}`, data);
            // Here you could send event data to analytics
            
            // Example: Google Analytics integration
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, data);
            }
        } catch (e) {
            Utils.errorHandler.log(e, 'event_tracking');
        }
    }
    
    setupEventListeners() {
        // Header navigation
        this.setupHeaderEvents();
        
        // Scroll events
        this.setupScrollEvents();
        
        // Keyboard events
        this.setupKeyboardEvents();
        
        // Click outside events
        this.setupClickOutsideEvents();
    }
    
    setupHeaderEvents() {
        // Mobile menu toggle
        const mobileMenuBtn = Utils.$('#mobileMenuBtn');
        const mobileMenuClose = Utils.$('#mobileMenuClose');
        const mobileMenu = Utils.$('#mobileMenu');
        
        if (mobileMenuBtn && mobileMenu) {
            Utils.addEvent(mobileMenuBtn, 'click', () => {
                this.toggleMobileMenu(true);
            });
        }
        
        if (mobileMenuClose && mobileMenu) {
            Utils.addEvent(mobileMenuClose, 'click', () => {
                this.toggleMobileMenu(false);
            });
        }
        
        // Categories dropdown
        const categoriesBtn = Utils.$('#categoriesBtn');
        const categoriesMenu = Utils.$('#categoriesMenu');
        
        if (categoriesBtn && categoriesMenu) {
            // Accessibility attributes
            categoriesBtn.setAttribute('aria-haspopup', 'true');
            categoriesBtn.setAttribute('aria-expanded', 'false');
            categoriesBtn.setAttribute('aria-controls', 'categoriesMenu');
            categoriesMenu.setAttribute('role', 'menu');
            categoriesMenu.setAttribute('aria-hidden', 'true');
            console.log('✅ Acordeón encontrado, configurando eventos...');
            Utils.addEvent(categoriesBtn, 'click', (e) => {
                e.stopPropagation();
                console.log('🔄 Click en acordeón detectado');
                this.toggleCategoriesMenu();
            });
        } else {
            console.warn('⚠️ Elementos del acordeón no encontrados:', {categoriesBtn, categoriesMenu});
        }
        
        // Smooth scroll for anchor links
        const anchorLinks = Utils.$$('a[href^="#"]');
        anchorLinks.forEach(link => {
            Utils.addEvent(link, 'click', (e) => {
                const href = link.getAttribute('href');
                if (href !== '#' && href.length > 1) {
                    e.preventDefault();
                    const target = Utils.$(href);
                    if (target) {
                        Utils.scroll.to(target);
                    }
                }
            });
        });

        // Ensure cart icon navigates to cart page on all pages
        this.setCartLinkTargets();
    }

    setCartLinkTargets() {
        try {
            const links = (Utils && Utils.$$) ? Utils.$$('.cart-link') : Array.from(document.querySelectorAll('.cart-link'));
            links.forEach(a => {
                if (a) a.setAttribute('href', '/cart.html');
            });
        } catch (_) { /* ignore */ }
    }
    
    setupScrollEvents() {
        let lastScrollY = window.scrollY;
        
        const handleScroll = Utils.rafThrottle(() => {
            lastScrollY = window.scrollY;
            this.updateHeaderOnScroll(lastScrollY);
            this.updateScrollToTop(lastScrollY);
        });
        
        Utils.addEvent(window, 'scroll', handleScroll);
    }
    
    setupKeyboardEvents() {
        Utils.addEvent(document, 'keydown', (e) => {
            // Escape key to close modals and menus
            if (e.key === 'Escape') {
                this.closeAllOverlays();
            }
            
            // Alt + S to focus search
            if (e.altKey && e.key === 's') {
                e.preventDefault();
                const searchInput = Utils.$('#searchInput');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Enter key to submit search when focused
            if (e.key === 'Enter' && e.target.id === 'searchInput') {
                const searchForm = Utils.$('#searchForm');
                if (searchForm) {
                    searchForm.dispatchEvent(new Event('submit', { bubbles: true }));
                }
            }
        });
    }
    
    setupClickOutsideEvents() {
        Utils.addEvent(document, 'click', (e) => {
            // Close categories menu when clicking outside
            const categoriesDropdown = Utils.$('.categories-dropdown');
            const categoriesMenu = Utils.$('#categoriesMenu');
            
            if (categoriesDropdown && categoriesMenu && 
                !categoriesDropdown.contains(e.target) && 
                categoriesMenu.classList.contains('active')) {
                this.toggleCategoriesMenu(false);
            }
            
            // Close search suggestions when clicking outside
            const searchContainer = Utils.$('.search-container');
            const searchSuggestions = Utils.$('.search-suggestions');
            
            if (searchContainer && searchSuggestions && 
                !searchContainer.contains(e.target)) {
                // Hide instead of removing so SmartSearch can reuse the element
                searchSuggestions.classList.remove('show');
            }
        });
    }
    
    initializeComponents() {
        // Initialize WhatsApp FAB early (even if other utilities fail)
        try {
            if (this.isHomePage()) this.createWhatsAppFab();
        } catch (e) {
            console.warn('[WA-FAB] init skipped', e);
        }

        // Initialize lazy loading (guarded)
        try { if (Utils && Utils.lazyLoad && Utils.lazyLoad.init) Utils.lazyLoad.init(); } catch (_) {}
        
        // Initialize animations on scroll (guarded)
        try { this.initScrollAnimations(); } catch (_) {}
        
        // Initialize performance monitoring (guarded)
        try { if (Utils && Utils.performance && Utils.performance.mark) Utils.performance.mark('app-initialized'); } catch (_) {}
        
        // Note: Carousels are initialized in carousel.js to avoid conflicts
    }
    
    initScrollAnimations() {
        // Animate elements when they come into view
        const animatedElements = Utils.$$('[data-animate]');
        
        if ('IntersectionObserver' in window) {
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        const animation = element.dataset.animate || 'fadeIn';
                        element.classList.add(`animate-${animation}`);
                        animationObserver.unobserve(element);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });
            
            animatedElements.forEach(el => animationObserver.observe(el));
        } else {
            // Fallback for older browsers
            animatedElements.forEach(el => {
                const animation = el.dataset.animate || 'fadeIn';
                el.classList.add(`animate-${animation}`);
            });
        }
    }
    
    handlePageLoad() {
        // Handle any URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        
        // Handle search parameter
        const searchQuery = urlParams.get('search') || urlParams.get('q');
        if (searchQuery) {
            const searchInput = Utils.$('#searchInput');
            if (searchInput) {
                searchInput.value = searchQuery;
            }
        }
        
        // Handle category parameter
        const category = urlParams.get('category');
        if (category) {
            this.highlightCategory(category);
        }
        
        // Mark page load complete
        Utils.performance.mark('page-load-complete');
        Utils.performance.measure('page-load-time', 'navigationStart', 'page-load-complete');
    }
    
    toggleMobileMenu(open = null) {
        const mobileMenu = Utils.$('#mobileMenu');
        const overlay = this.getOrCreateOverlay();
        
        if (!mobileMenu) return;
        
        const isOpen = open !== null ? open : !mobileMenu.classList.contains('active');
        
        if (isOpen) {
            mobileMenu.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    toggleCategoriesMenu(open = null) {
        const categoriesBtn = Utils.$('#categoriesBtn');
        const categoriesMenu = Utils.$('#categoriesMenu');
        
        if (!categoriesBtn || !categoriesMenu) {
            console.warn('⚠️ Elementos no encontrados en toggleCategoriesMenu');
            return;
        }
        
        const isOpen = open !== null ? open : !categoriesMenu.classList.contains('active');
        
        if (isOpen) {
            // Abrir acordeón con animaciones optimizadas
            categoriesMenu.classList.add('active');
            categoriesBtn.classList.add('active');
            categoriesBtn.setAttribute('aria-expanded', 'true');
            categoriesMenu.setAttribute('aria-hidden', 'false');
            
            // Animar items con delay escalonado usando RAF para mejor rendimiento
            const items = categoriesMenu.querySelectorAll('.category-item');
            items.forEach((item, index) => {
                requestAnimationFrame(() => {
                    item.style.transitionDelay = `${index * 0.05}s`;
                });
            });
        } else {
            // Cerrar acordeón
            categoriesMenu.classList.remove('active');
            categoriesBtn.classList.remove('active');
            categoriesBtn.setAttribute('aria-expanded', 'false');
            categoriesMenu.setAttribute('aria-hidden', 'true');
            
            // Resetear delays inmediatamente
            const items = categoriesMenu.querySelectorAll('.category-item');
            items.forEach(item => {
                item.style.transitionDelay = '0s';
            });
        }
    }
    
    getOrCreateOverlay() {
        let overlay = Utils.$('.mobile-menu-overlay');
        
        if (!overlay) {
            overlay = Utils.createElement('div', 'mobile-menu-overlay');
            Utils.addEvent(overlay, 'click', () => {
                this.closeAllOverlays();
            });
            document.body.appendChild(overlay);
        }
        
        return overlay;
    }
    
    closeAllOverlays() {
        // Close mobile menu
        this.toggleMobileMenu(false);
        
        // Close categories menu
        this.toggleCategoriesMenu(false);
        
        // Close contact modal
        const contactModal = Utils.$('#contactModal');
        if (contactModal && contactModal.classList.contains('active')) {
            if (window.FormManager) {
                window.FormManager.closeContactModal();
            }
        }
        
        // Remove search suggestions
        const searchSuggestions = Utils.$('.search-suggestions');
        if (searchSuggestions) {
            // Hide instead of removing so SmartSearch can reuse the element
            searchSuggestions.classList.remove('show');
        }
        
        // Clean up any remaining event listeners
        this.cleanupEventListeners();
    }
    
    cleanupEventListeners() {
        // Remove any temporary event listeners to prevent memory leaks
        if (this.eventListeners.size > 0) {
            this.eventListeners.forEach((listener, element) => {
                if (element && element.removeEventListener) {
                    element.removeEventListener('click', listener);
                }
            });
            this.eventListeners.clear();
        }
    }
    
    updateHeaderOnScroll(scrollY) {
        const header = Utils.$('.header');
        if (!header) return;
        
        // Add/remove scrolled class based on scroll position
        if (scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    updateScrollToTop(scrollY) {
        // Feature disabled: ensure the button is removed if present
        const scrollToTopBtn = Utils.$('#scrollToTop');
        if (scrollToTopBtn && scrollToTopBtn.parentNode) {
            scrollToTopBtn.parentNode.removeChild(scrollToTopBtn);
        }
        return;
    }
    
    createScrollToTopButton() {
        const button = Utils.createElement('button', 'scroll-to-top');
        button.id = 'scrollToTop';
        button.innerHTML = `
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="18,15 12,9 6,15"></polyline>
            </svg>
        `;
        button.setAttribute('aria-label', 'Volver arriba');
        
        Utils.addEvent(button, 'click', () => {
            Utils.scroll.toTop();
        });
        
        document.body.appendChild(button);
        return button;
    }

    // ---- WhatsApp FAB (Home) ----
    isHomePage() {
        const p = location.pathname.replace(/\/+/g, '/');
        return p === '/' || /\/index\.html?$/i.test(p);
    }

    createWhatsAppFab() {
        try {
            if (Utils.$('#waFab')) return;

            const fab = document.createElement('button');
            fab.id = 'waFab';
            // Force default position bottom-right
            fab.className = 'wa-fab pos-br';
            // Inline styles to override any conflicting CSS
            fab.style.position = 'fixed';
            fab.style.right = '16px';
            fab.style.left = 'auto';
            fab.style.bottom = '24px';
            fab.style.top = 'auto';
            fab.style.zIndex = '10010';
            fab.setAttribute('aria-label', 'Comprar por WhatsApp');
            fab.innerHTML = `
                <span class="wa-icon" aria-hidden="true">
                    <svg class="icon-wsp" viewBox="0 0 32 32" fill="currentColor" width="22" height="22">
                        <path d="M19.11 17.8c-.28-.15-1.65-.82-1.9-.91-.25-.09-.43-.14-.62.14-.19.28-.71.91-.87 1.1-.16.19-.32.21-.6.07-.28-.14-1.16-.43-2.2-1.38-.81-.72-1.36-1.61-1.52-1.88-.16-.28-.02-.43.12-.58.12-.12.28-.32.42-.48.14-.16.19-.28.28-.47.09-.19.05-.36-.02-.5-.07-.14-.62-1.49-.85-2.04-.22-.52-.44-.45-.62-.46l-.53-.01c-.19 0-.5.07-.77.36-.28.28-1.02.99-1.02 2.41s1.05 2.8 1.2 2.99c.14.19 2.07 3.16 5.01 4.43.7.3 1.25.48 1.68.61.71.23 1.35.2 1.86.12.57-.08 1.65-.67 1.89-1.32.23-.64.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/>
                        <path d="M26.77 5.23A11.9 11.9 0 0016 2.1 11.9 11.9 0 005.23 5.23 11.9 11.9 0 002.1 16c0 2.1.54 4.16 1.57 5.98L2 30l8.2-1.64A13.9 13.9 0 0016 29.9c6.38 0 11.9-4.3 13.19-10.48 1.29-6.18-2.36-12.35-8.42-14.19zM16 27.78c-2.12 0-4.18-.6-5.96-1.74l-.43-.27-4.86.97.99-4.74-.28-.45A11.8 11.8 0 014.22 16C4.22 9.5 9.5 4.22 16 4.22S27.78 9.5 27.78 16 22.5 27.78 16 27.78z"/>
                    </svg>
                    <svg class="icon-x" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </span>
                <span class="wa-label">
                    <span>Comprar por WhatsApp</span>
                    <svg class="wa-label-icon" viewBox="0 0 32 32" fill="currentColor" width="18" height="18" aria-hidden="true">
                        <path d="M19.11 17.8c-.28-.15-1.65-.82-1.9-.91-.25-.09-.43-.14-.62.14-.19.28-.71.91-.87 1.1-.16.19-.32.21-.6.07-.28-.14-1.16-.43-2.2-1.38-.81-.72-1.36-1.61-1.52-1.88-.16-.28-.02-.43.12-.58.12-.12.28-.32.42-.48.14-.16.19-.28.28-.47.09-.19.05-.36-.02-.5-.07-.14-.62-1.49-.85-2.04-.22-.52-.44-.45-.62-.46l-.53-.01c-.19 0-.5.07-.77.36-.28.28-1.02.99-1.02 2.41s1.05 2.8 1.2 2.99c.14.19 2.07 3.16 5.01 4.43.7.3 1.25.48 1.68.61.71.23 1.35.2 1.86.12.57-.08 1.65-.67 1.89-1.32.23-.64.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z"/>
                    </svg>
                </span>
            `;

            // Toggle + open behavior
            let autoCloseTimer = null;
            let hoverTimer = null;
            
            const expand = () => {
                fab.classList.add('expanded');
                clearTimeout(autoCloseTimer);
                clearTimeout(hoverTimer);
            };
            
            const collapse = () => {
                fab.classList.remove('expanded');
                clearTimeout(autoCloseTimer);
                clearTimeout(hoverTimer);
            };
            
            const toggle = () => {
                fab.classList.toggle('expanded');
                clearTimeout(autoCloseTimer);
                clearTimeout(hoverTimer);
                if (fab.classList.contains('expanded')) {
                    // Keep expanded for 30 seconds before auto-collapsing
                    autoCloseTimer = setTimeout(() => fab.classList.remove('expanded'), 30000);
                }
            };

            // Hover behavior - expand on hover
            fab.addEventListener('mouseenter', () => {
                clearTimeout(hoverTimer);
                expand();
            });
            
            fab.addEventListener('mouseleave', () => {
                // Delay collapse to prevent flickering - close after 0.5 seconds
                hoverTimer = setTimeout(() => {
                    collapse();
                }, 500);
            });

            // Icon (circle) toggles expand/collapse on click
            const iconEl = fab.querySelector('.wa-icon');
            if (iconEl) {
                iconEl.style.cursor = 'pointer';
                iconEl.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    toggle();
                });
            }

            // Label opens WhatsApp
            const labelEl = fab.querySelector('.wa-label');
            if (labelEl) {
                labelEl.style.cursor = 'pointer';
                labelEl.addEventListener('click', (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    this.openWhatsAppHome();
                });
            }

            // Prevent parent button default clicks from interfering
            fab.addEventListener('click', (e) => e.preventDefault());

            document.body.appendChild(fab);
        } catch (e) {
            console.warn('[WA-FAB] init error', e);
        }
    }

    openWhatsAppHome() {
        const number = (window.CredicAlidda && window.CredicAlidda.whatsapp)
            || (window.SiteSettings && window.SiteSettings.whatsapp)
            || '51967156094';
        const msg = 'Hola, estoy interesado en comprar un producto.';
        const link = `https://api.whatsapp.com/send/?phone=${number}&text=${encodeURIComponent(msg)}&type=phone_number&app_absent=0`;
        window.open(link, '_blank');
    }
    
    highlightCategory(category) {
        const categoryLinks = Utils.$$(`[href*="${category}"]`);
        categoryLinks.forEach(link => {
            link.classList.add('active-category');
        });
    }
    
    // Analytics tracking
    trackEvent(eventName, properties = {}) {
        try {
            // Store analytics events locally
            const events = Utils.storage.get('analytics_events') || [];
            
            const event = {
                name: eventName,
                properties: {
                    ...properties,
                    timestamp: new Date().toISOString(),
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    sessionId: this.getSessionId()
                }
            };
            
            events.push(event);
            
            // Keep only last 100 events to avoid storage bloat
            if (events.length > 100) {
                events.splice(0, events.length - 100);
            }
            
            Utils.storage.set('analytics_events', events);
            
            // In production, send to analytics service
            if (window.gtag) {
                window.gtag('event', eventName, properties);
            }
            
        } catch (error) {
            Utils.errorHandler.log(error, 'trackEvent');
        }
    }
    
    getSessionId() {
        let sessionId = Utils.storage.get('session_id');
        
        if (!sessionId) {
            sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            Utils.storage.set('session_id', sessionId);
        }
        
        return sessionId;
    }
    
    // Performance monitoring
    reportPerformance() {
        if (!window.performance) return;

        // Prefer PerformanceNavigationTiming (modern) over deprecated performance.timing
        let pageLoadTime = null, domReadyTime = null, firstByteTime = null;
        let navigationType = 'unknown', redirectCount = 0;

        try {
            const navEntries = performance.getEntriesByType && performance.getEntriesByType('navigation');
            if (navEntries && navEntries.length > 0) {
                const nav = navEntries[0];
                pageLoadTime = nav.loadEventEnd - nav.startTime;
                domReadyTime = nav.domContentLoadedEventEnd - nav.startTime;
                firstByteTime = nav.responseStart - nav.startTime;
                navigationType = nav.type || navigationType;
                redirectCount = nav.redirectCount || 0;
            } else if (performance.timing) {
                const t = performance.timing;
                // Ensure end markers exist before subtracting
                pageLoadTime = (t.loadEventEnd && t.navigationStart) ? (t.loadEventEnd - t.navigationStart) : null;
                domReadyTime = (t.domContentLoadedEventEnd && t.navigationStart) ? (t.domContentLoadedEventEnd - t.navigationStart) : null;
                firstByteTime = (t.responseStart && t.navigationStart) ? (t.responseStart - t.navigationStart) : null;
                if (performance.navigation) {
                    navigationType = performance.navigation.type;
                    redirectCount = performance.navigation.redirectCount;
                }
            }
        } catch (_) { /* swallow errors safely */ }

        const metrics = {
            pageLoadTime,
            domReadyTime,
            firstByteTime,
            navigationType,
            redirectCount,
            connectionType: navigator.connection?.effectiveType || 'unknown',
            timestamp: new Date().toISOString()
        };
        
        // Store performance data
        const performanceData = Utils.storage.get('performance_data') || [];
        performanceData.push(metrics);
        
        // Keep only last 10 entries
        if (performanceData.length > 10) {
            performanceData.splice(0, performanceData.length - 10);
        }
        
        Utils.storage.set('performance_data', performanceData);
        
        // Log slow pages
        if (metrics.pageLoadTime > 3000) {
            Utils.errorHandler.log(
                `Slow page load: ${metrics.pageLoadTime}ms`,
                'performance'
            );
        }
    }
}

// Report performance when page is fully loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.CredicaliddaApp && typeof window.CredicaliddaApp.reportPerformance === 'function') {
            window.CredicaliddaApp.reportPerformance();
        }
    }, 100);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.CredicaliddaApp && typeof window.CredicaliddaApp.trackEvent === 'function') {
        window.CredicaliddaApp.trackEvent('page_visibility_change', {
            visibility_state: document.visibilityState
        });
    }
});

// Handle unload events
window.addEventListener('beforeunload', () => {
    if (window.CredicaliddaApp && typeof window.CredicaliddaApp.trackEvent === 'function') {
        window.CredicaliddaApp.trackEvent('page_unload');
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    if (Utils && Utils.errorHandler) {
        Utils.errorHandler.log(event.error, 'global_error');
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    if (Utils && Utils.errorHandler) {
        Utils.errorHandler.log(event.reason, 'unhandled_promise_rejection');
    }
});

// Promotional Cards Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Handle promotional card clicks
    const promoCards = document.querySelectorAll('.promo-card');
    
    promoCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on a button
            if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
                return;
            }
            
            const cardImg = card.querySelector('img');
            if (cardImg) {
                const altText = cardImg.alt;
                
                // Route to appropriate category based on promo type
                if (altText.includes('Apple')) {
                    window.location.href = '/categoria/tecnologia?brand=apple';
                } else if (altText.includes('Samsung') || altText.includes('LG')) {
                    window.location.href = '/categoria/televisores';
                } else if (altText.includes('CrediChat')) {
                    // Open CrediChat modal or redirect
                    openCrediChatModal();
                }
            }
        });
    });
    
    // Handle promotional buttons
    const promoButtons = document.querySelectorAll('.promo-card .btn');
    
    promoButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const buttonText = button.textContent.trim();
            
            switch(buttonText) {
                case 'Ver Ofertas Apple':
                    window.location.href = '/categoria/tecnologia?brand=apple&offer=true';
                    break;
                case 'Ver TVs en Oferta':
                    window.location.href = '/categoria/televisores?offer=true';
                    break;
                case 'Probar CrediChat':
                    openCrediChatModal();
                    break;
                default:
                    // Generic handler
                    console.log('Promo button clicked:', buttonText);
            }
            
            // Track event
            if (window.CredicaliddaApp) {
                window.CredicaliddaApp.trackEvent('promo_button_click', {
                    button_text: buttonText,
                    timestamp: new Date().toISOString()
                });
            }
        });
    });
});

// CrediChat Modal Function
function openCrediChatModal() {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'credichat-modal-overlay';
    modalOverlay.innerHTML = `
        <div class="credichat-modal">
            <div class="credichat-modal-header">
                <h3>¡Bienvenido a CrediChat!</h3>
                <button class="credichat-modal-close">&times;</button>
            </div>
            <div class="credichat-modal-body">
                <div class="credichat-info">
                    <div class="credichat-logo">
                        <span class="credi-text">Credi</span>
                        <span class="chat-text">Chat</span>
                    </div>
                    <p>Financia miles de productos con validación facial</p>
                    <div class="credichat-features">
                        <div class="feature-item">
                            <span class="feature-icon">✅</span>
                            <span>Proceso 100% digital</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">⚡</span>
                            <span>Aprobación en minutos</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">🔒</span>
                            <span>Validación facial segura</span>
                        </div>
                    </div>
                    <div class="credichat-actions">
                        <button class="btn btn-primary" onclick="startCrediChat()">Comenzar Ahora</button>
                        <button class="btn btn-outline" onclick="learnMoreCrediChat()">Saber Más</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal styles
    const modalStyles = document.createElement('style');
    modalStyles.textContent = `
        .credichat-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .credichat-modal {
            background: white;
            border-radius: 16px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .credichat-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .credichat-modal-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
        }
        
        .credichat-modal-body {
            padding: 2rem;
        }
        
        .credichat-logo {
            font-size: 2rem;
            font-weight: 900;
            text-align: center;
            margin-bottom: 1rem;
        }
        
        .credichat-logo .credi-text {
            color: #2563eb;
        }
        
        .credichat-logo .chat-text {
            color: #f59e0b;
        }
        
        .credichat-features {
            margin: 1.5rem 0;
        }
        
        .feature-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0.8rem 0;
            font-size: 0.95rem;
        }
        
        .credichat-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
        }
        
        @media (max-width: 768px) {
            .credichat-actions {
                flex-direction: column;
            }
        }
    `;
    
    document.head.appendChild(modalStyles);
    document.body.appendChild(modalOverlay);
    
    // Close modal handlers
    modalOverlay.querySelector('.credichat-modal-close').addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
        document.head.removeChild(modalStyles);
    });
    
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
            document.head.removeChild(modalStyles);
        }
    });
}

// CrediChat Actions
function startCrediChat() {
    // Redirect to CrediChat flow or open chat widget
    window.open('https://wa.me/51999999999?text=Hola%2C%20quiero%20saber%20más%20sobre%20CrediChat', '_blank');
    
    // Track event
    if (window.CredicaliddaApp) {
        window.CredicaliddaApp.trackEvent('credichat_start', {
            source: 'promo_modal',
            timestamp: new Date().toISOString()
        });
    }
}

function learnMoreCrediChat() {
    // Redirect to CrediChat info page
    window.location.href = '/credichat';
    
    // Track event
    if (window.CredicaliddaApp && typeof window.CredicaliddaApp.trackEvent === 'function') {
        window.CredicaliddaApp.trackEvent('credichat_learn_more', {
            source: 'promo_modal',
            timestamp: new Date().toISOString()
        });
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Performance monitoring
    if (window.performance && window.performance.mark) {
        window.performance.mark('dom-content-loaded');
    }
    
    // Wait for Utils to be loaded from utils.js
    if (typeof Utils === 'undefined') {
        console.log('Waiting for Utils to load...');
        setTimeout(() => {
            initializeApp();
        }, 100);
    } else {
        initializeApp();
    }
});

function initializeApp() {
    try {
        // Export for global access
        window.CredicaliddaApp = new CredicaliddaApp();
        
        // Track page view
        if (window.CredicaliddaApp && typeof window.CredicaliddaApp.trackEvent === 'function') {
            window.CredicaliddaApp.trackEvent('page_view', {
                page_title: document.title,
                page_path: window.location.pathname
            });
        }
    } catch (error) {
        if (typeof Utils !== 'undefined' && Utils.errorHandler) {
            Utils.errorHandler.log(error, 'app_initialization');
        } else {
            console.error('Failed to initialize CredicaliddaApp:', error);
        }
    }
}
