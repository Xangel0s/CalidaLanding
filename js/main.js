// Main JavaScript file for Credicálidda website

// Main application class
class CredicaliddaApp {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeComponents();
        this.handlePageLoad();
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
            Utils.addEvent(categoriesBtn, 'click', (e) => {
                e.stopPropagation();
                this.toggleCategoriesMenu();
            });
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
    }
    
    setupScrollEvents() {
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const handleScroll = () => {
            lastScrollY = window.scrollY;
            
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateHeaderOnScroll(lastScrollY);
                    this.updateScrollToTop(lastScrollY);
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        Utils.addEvent(window, 'scroll', Utils.throttle(handleScroll, 16));
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
                searchSuggestions.remove();
            }
        });
    }
    
    initializeComponents() {
        // Initialize lazy loading
        Utils.lazyLoad.init();
        
        // Initialize animations on scroll
        this.initScrollAnimations();
        
        // Initialize carousels
        this.initializeCarousels();
        
        // Initialize performance monitoring
        Utils.performance.mark('app-initialized');
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
        
        if (!categoriesBtn || !categoriesMenu) return;
        
        const isOpen = open !== null ? open : !categoriesMenu.classList.contains('active');
        
        if (isOpen) {
            categoriesMenu.classList.add('active');
            categoriesBtn.classList.add('active');
        } else {
            categoriesMenu.classList.remove('active');
            categoriesBtn.classList.remove('active');
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
            searchSuggestions.remove();
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
        let scrollToTopBtn = Utils.$('#scrollToTop');
        
        // Create scroll to top button if it doesn't exist
        if (!scrollToTopBtn && scrollY > 500) {
            scrollToTopBtn = this.createScrollToTopButton();
        }
        
        if (scrollToTopBtn) {
            if (scrollY > 500) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }
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
        
        const timing = performance.timing;
        const navigation = performance.navigation;
        
        const metrics = {
            // Page load metrics
            pageLoadTime: timing.loadEventEnd - timing.navigationStart,
            domReadyTime: timing.domContentLoadedEventEnd - timing.navigationStart,
            firstByteTime: timing.responseStart - timing.navigationStart,
            
            // Navigation type
            navigationType: navigation.type,
            redirectCount: navigation.redirectCount,
            
            // Connection info
            connectionType: navigator.connection?.effectiveType || 'unknown',
            
            // Timestamp
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
    
    initializeCarousels() {
        // Initialize Hero Carousel with auto-play
        const heroContainer = Utils.$('#heroSlider');
        if (heroContainer) {
            this.heroCarousel = new Carousel(heroContainer.parentElement, {
                autoPlay: true,
                autoPlayInterval: 5000,
                loop: true,
                itemsToShow: 1
            });
        }
        
        // Initialize Categories Carousel
        const categoriesContainer = Utils.$('#categoriesCarousel');
        if (categoriesContainer) {
            this.categoriesCarousel = new Carousel(categoriesContainer, {
                autoPlay: false,
                loop: true,
                itemsToShow: 3,
                breakpoints: {
                    480: { itemsToShow: 2 },
                    768: { itemsToShow: 4 },
                    1024: { itemsToShow: 6 },
                    1200: { itemsToShow: 8 }
                }
            });
        }
        
        // Initialize Products Carousel
        const productsContainer = Utils.$('#productsCarousel');
        if (productsContainer) {
            this.productsCarousel = new Carousel(productsContainer, {
                autoPlay: false,
                loop: true,
                itemsToShow: 1,
                breakpoints: {
                    480: { itemsToShow: 2 },
                    768: { itemsToShow: 3 },
                    1024: { itemsToShow: 4 },
                    1200: { itemsToShow: 5 }
                }
            });
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.CredicaliddaApp = new CredicaliddaApp();
    
    // Track page view
    window.CredicaliddaApp.trackEvent('page_view', {
        page_title: document.title,
        page_path: window.location.pathname
    });
});

// Report performance when page is fully loaded
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.CredicaliddaApp) {
            window.CredicaliddaApp.reportPerformance();
        }
    }, 100);
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.CredicaliddaApp) {
        window.CredicaliddaApp.trackEvent('page_visibility_change', {
            visibility_state: document.visibilityState
        });
    }
});

// Handle unload events
window.addEventListener('beforeunload', () => {
    if (window.CredicaliddaApp) {
        window.CredicaliddaApp.trackEvent('page_unload');
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    Utils.errorHandler.log(event.error, 'global_error');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    Utils.errorHandler.log(event.reason, 'unhandled_promise_rejection');
});

// Export for global access
window.CredicaliddaApp = CredicaliddaApp;

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
    if (window.CredicaliddaApp) {
        window.CredicaliddaApp.trackEvent('credichat_learn_more', {
            source: 'promo_modal',
            timestamp: new Date().toISOString()
        });
    }
}
