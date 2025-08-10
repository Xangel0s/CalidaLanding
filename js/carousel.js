// Carousel functionality for Credicálidda website

class Carousel {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? Utils.$(container) : container;
        if (!this.container) return;
        // Prevent double-initialization on the same container
        if (this.container.dataset.carouselInitialized === 'true') {
            console.warn('Carousel already initialized, skipping:', this.container.id || this.container.className);
            return false;
        }
        
        this.options = {
            autoPlay: false,
            autoPlayInterval: 5000,
            loop: true,
            infiniteScroll: false,
            itemsToShow: 1,
            itemsToScroll: 1,
            gap: 24,
            breakpoints: {
                768: { itemsToShow: 2 },
                1024: { itemsToShow: 3 },
                1200: { itemsToShow: 4 }
            },
            ...options
        };
        
        this.currentIndex = 0;
        this.itemsToShow = this.options.itemsToShow;
        this.isTransitioning = false;
        this.autoPlayTimer = null;
        this.originalItems = [];
        
        const inited = this.init();

        // Mark as initialized only if init succeeded
        if (inited) {
            this.container.dataset.carouselInitialized = 'true';
        }
    }
    
    init() {
        const setupSuccess = this.setupElements();
        
        if (!setupSuccess) {
            console.warn('Carousel initialization failed: setup unsuccessful for:', this.container.id || this.container.className);
            return false;
        }
        
        // Calculate itemsToShow early for correct cloning math
        this.updateItemsToShow();

        // For infinite scroll carousels, setup clones after itemsToShow is known
        if (this.options.infiniteScroll) {
            this.setupInfiniteScroll();
        }

        this.setupEventListeners();
        this.updateView();
        
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
        
        return true;
    }
    
    setupElements() {
        // Detect carousel type and setup track accordingly
        const carouselType = this.detectCarouselType();
        
        switch (carouselType) {
            case 'hero':
                this.setupHeroCarousel();
                break;
            case 'categories':
                this.setupStandardCarousel('.categories-track, #categoriesTrack');
                break;
            case 'products':
                this.setupStandardCarousel('.best-sellers-track, #featuredProductsTrack, #bestSellersTrack');
                break;
            default:
                this.setupFallbackCarousel();
        }
        
        if (!this.track || this.items.length === 0) {
            console.warn('Carousel setup failed for:', this.container.id || this.container.className);
            return false;
        }
        
        this.setupCarouselControls();
        this.applyTrackStyles();
        
        console.log(`Carousel [${carouselType}] initialized:`, this.container.id || this.container.className, 'with', this.items.length, 'items');
        return true;
    }
    
    detectCarouselType() {
        const containerId = this.container.id;
        const containerClass = this.container.className;
        
        // Hero banner es manejado por `HeroSlider` dedicado; no usar `Carousel` para hero
        if (containerId.includes('categories') || containerClass.includes('categories')) {
            return 'categories';
        } else if (containerId.includes('Products') || containerId.includes('Sellers') || containerClass.includes('products') || containerClass.includes('sellers')) {
            return 'products';
        }
        return 'unknown';
    }
    
    setupHeroCarousel() {
        console.log('Setting up professional hero carousel with auto-play');
        
        // Para hero slider, el container es el track
        this.track = this.container;
        
        // Obtener todos los slides del hero
        this.items = [...this.track.children];
        this.originalItems = [...this.items];
        
        if (this.items.length === 0) {
            console.warn('No hero slides found');
            return false;
        }
        
        console.log(`Found ${this.items.length} hero slides`);
        
        // Configurar controles específicos del hero
        this.setupHeroControls();
        
        // Configurar auto-play profesional
        this.initializeHeroAutoPlay();
        
        // Aplicar estilos de posicionamiento al container
        this.container.style.cssText = `
            position: relative;
            overflow: hidden;
            width: 100%;
            height: 100%;
        `;
        
        // Configurar cada slide para animación fade profesional
        this.items.forEach((slide, index) => {
            this.configureHeroSlide(slide, index);
        });
        
        // Configurar eventos de pausa profesionales
        this.setupHeroPauseEvents();
        
        // Iniciar auto-play
        this.startHeroAutoPlay();
        
        console.log('Professional hero carousel setup completed successfully');
        return true;
    }
    
    setupStandardCarousel(trackSelector) {
        // For standard carousels, find track within container
        this.track = this.container.querySelector(trackSelector);
        if (this.track) {
            this.items = [...this.track.children];
            this.originalItems = [...this.items];
        }
    }
    
    setupFallbackCarousel() {
        // Fallback: try common selectors
        const selectors = [
            '.categories-track', '.best-sellers-track', '.products-track',
            '#categoriesTrack', '#featuredProductsTrack', '#bestSellersTrack'
        ];
        
        for (const selector of selectors) {
            this.track = this.container.querySelector(selector);
            if (this.track) {
                this.items = [...this.track.children];
                this.originalItems = [...this.items];
                break;
            }
        }
        
        // Last resort: use container as track
        if (!this.track) {
            this.track = this.container;
            this.items = [...this.track.children];
            this.originalItems = [...this.items];
        }
    }

    // ====================================
    // HERO CAROUSEL AUTO-PLAY METHODS
    // ====================================

    /**
     * Inicializa la configuración de auto-play para hero carousel
     * Siguiendo principios SOLID y manejo de errores robusto
     */
    initializeHeroAutoPlay() {
        // Configuración por defecto con validación
        this.autoPlayConfig = {
            interval: this.options.autoPlayInterval || 5000,
            enabled: this.options.autoPlay !== false,
            pauseOnHover: true,
            pauseOnFocus: true,
            resumeDelay: 1000
        };
        
        // Estado del auto-play
        this.autoPlayState = {
            timer: null,
            isPaused: false,
            isActive: false,
            userInteracting: false
        };
        
        console.log('Hero auto-play initialized with config:', this.autoPlayConfig);
    }

    /**
     * Configura controles específicos del hero carousel
     * Implementa patrón Observer para manejo de eventos
     */
    setupHeroControls() {
        // CORRECCIÓN: Buscar controles en el elemento padre del slider o en todo el documento
        const heroSection = this.container.closest('.hero') || this.container.parentElement;
        
        // Buscar botones prev/next fuera del slider
        this.prevBtn = heroSection ? heroSection.querySelector('#heroPrev, .hero-prev') : document.querySelector('#heroPrev');
        this.nextBtn = heroSection ? heroSection.querySelector('#heroNext, .hero-next') : document.querySelector('#heroNext');
        this.indicators = heroSection ? heroSection.querySelector('#heroIndicators, .hero-indicators') : document.querySelector('#heroIndicators');
        
        // Si no encontramos en hero section, buscar globalmente
        if (!this.prevBtn) this.prevBtn = document.querySelector('#heroPrev, .hero-prev');
        if (!this.nextBtn) this.nextBtn = document.querySelector('#heroNext, .hero-next');
        if (!this.indicators) this.indicators = document.querySelector('#heroIndicators, .hero-indicators');
        
        console.log('Hero controls found:', {
            heroSection: !!heroSection,
            prevBtn: !!this.prevBtn,
            nextBtn: !!this.nextBtn,
            indicators: !!this.indicators,
            slides: this.items.length
        });
        
        // Configurar indicadores con delegación de eventos
        this.setupHeroIndicators();
        
        console.log('Hero controls configured:', {
            prevBtn: !!this.prevBtn,
            nextBtn: !!this.nextBtn,
            indicators: !!this.indicators
        });
    }

    /**
     * Configura cada slide del hero con estilos optimizados
     * Implementa principio de responsabilidad única
     */
    configureHeroSlide(slide, index) {
        // Aplicar estilos base del slide
        slide.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: ${index === 0 ? '1' : '0'};
            transition: opacity 0.8s cubic-bezier(0.4, 0.0, 0.2, 1);
            z-index: ${index === 0 ? '2' : '1'};
            will-change: opacity;
        `;
        
        // Configurar clase activa
        if (index === 0) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
        
        // Optimizar imágenes dentro del slide
        this.optimizeSlideImages(slide);
    }

    /**
     * Optimiza imágenes dentro de un slide
     * Implementa mejores prácticas de performance
     */
    optimizeSlideImages(slide) {
        const images = slide.querySelectorAll('img, .hero-bg');
        images.forEach(img => {
            if (img.tagName === 'IMG') {
                // No aplicar estilos a imágenes de categorías
                if (img.closest('.category-icon') || img.closest('.category-card')) {
                    return;
                }
                
                img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    will-change: transform;
                `;
            }
        });
    }

    /**
     * Configura indicadores del hero con manejo de eventos eficiente
     * Usa delegación de eventos para mejor performance
     */
    setupHeroIndicators() {
        if (!this.indicators) {
            console.warn('Hero indicators not found');
            return;
        }
        
        // Usar delegación de eventos (mejor práctica)
        Utils.addEvent(this.indicators, 'click', (e) => {
            const indicator = e.target.closest('.hero-indicator');
            if (!indicator) return;
            
            // Obtener índice del data-slide o por posición
            let slideIndex = parseInt(indicator.dataset.slide);
            if (isNaN(slideIndex)) {
                slideIndex = Array.from(indicator.parentElement.children).indexOf(indicator);
            }
            
            console.log('Hero indicator clicked:', slideIndex);
            
            // Marcar interacción del usuario
            this.handleUserInteraction(() => {
                this.goToSlide(slideIndex);
            });
        });
        
        // Configurar indicadores iniciales
        const indicatorButtons = this.indicators.querySelectorAll('.hero-indicator');
        indicatorButtons.forEach((indicator, index) => {
            // Asegurar que tengan el data-slide correcto
            if (!indicator.dataset.slide) {
                indicator.dataset.slide = index.toString();
            }
            
            // Configurar aria-labels para accesibilidad
            indicator.setAttribute('aria-label', `Ir a slide ${index + 1}`);
            indicator.setAttribute('role', 'button');
            indicator.setAttribute('tabindex', '0');
        });
        
        console.log('Hero indicators configured with delegation, found:', indicatorButtons.length, 'indicators');
    }

    /**
     * Configura eventos de pausa profesionales
     * Implementa múltiples estrategias de pausa según contexto
     */
    setupHeroPauseEvents() {
        if (!this.autoPlayConfig.enabled) return;
        
        // Pausa al hacer hover (mejor experiencia de usuario)
        if (this.autoPlayConfig.pauseOnHover) {
            Utils.addEvent(this.container, 'mouseenter', () => {
                this.pauseHeroAutoPlay('hover');
            });
            
            Utils.addEvent(this.container, 'mouseleave', () => {
                this.resumeHeroAutoPlay('hover');
            });
        }
        
        // Pausa al enfocar controles (accesibilidad)
        if (this.autoPlayConfig.pauseOnFocus) {
            [this.prevBtn, this.nextBtn, this.indicators].forEach(element => {
                if (element) {
                    Utils.addEvent(element, 'focusin', () => {
                        this.pauseHeroAutoPlay('focus');
                    });
                    
                    Utils.addEvent(element, 'focusout', () => {
                        this.resumeHeroAutoPlay('focus');
                    });
                }
            });
        }
        
        // Pausa cuando la página no está visible (optimización de recursos)
        Utils.addEvent(document, 'visibilitychange', () => {
            if (document.hidden) {
                this.pauseHeroAutoPlay('visibility');
            } else {
                this.resumeHeroAutoPlay('visibility');
            }
        });
        
        // Pausa durante interacciones táctiles (móviles)
        Utils.addEvent(this.container, 'touchstart', () => {
            this.pauseHeroAutoPlay('touch');
        });
        
        Utils.addEvent(this.container, 'touchend', () => {
            setTimeout(() => {
                this.resumeHeroAutoPlay('touch');
            }, 1000);
        });
        
        console.log('Hero pause events configured');
    }

    /**
     * Inicia el auto-play del hero carousel
     * Implementa patrón State para manejo de estados
     */
    startHeroAutoPlay() {
        if (!this.autoPlayConfig.enabled || this.autoPlayState.isActive) return;
        
        this.autoPlayState.isActive = true;
        this.autoPlayState.timer = setInterval(() => {
            if (!this.autoPlayState.isPaused && !this.autoPlayState.userInteracting) {
                this.next();
            }
        }, this.autoPlayConfig.interval);
        
        console.log(`Hero auto-play started with ${this.autoPlayConfig.interval}ms interval`);
    }

    /**
     * Pausa el auto-play del hero carousel
     * @param {string} reason - Razón de la pausa para debugging
     */
    pauseHeroAutoPlay(reason = 'manual') {
        if (!this.autoPlayState.isActive) return;
        
        this.autoPlayState.isPaused = true;
        console.log(`Hero auto-play paused (reason: ${reason})`);
    }

    /**
     * Reanuda el auto-play del hero carousel
     * @param {string} reason - Razón de la reanudación para debugging
     */
    resumeHeroAutoPlay(reason = 'manual') {
        if (!this.autoPlayState.isActive) return;
        
        // Usar delay para evitar cambios bruscos
        setTimeout(() => {
            this.autoPlayState.isPaused = false;
            console.log(`Hero auto-play resumed (reason: ${reason})`);
        }, this.autoPlayConfig.resumeDelay);
    }

    /**
     * Detiene completamente el auto-play del hero carousel
     */
    stopHeroAutoPlay() {
        if (this.autoPlayState.timer) {
            clearInterval(this.autoPlayState.timer);
            this.autoPlayState.timer = null;
            this.autoPlayState.isActive = false;
            this.autoPlayState.isPaused = false;
            console.log('Hero auto-play stopped');
        }
    }

    /**
     * Reinicia el auto-play del hero carousel
     * Útil después de interacciones del usuario
     */
    restartHeroAutoPlay() {
        this.stopHeroAutoPlay();
        setTimeout(() => {
            this.startHeroAutoPlay();
        }, this.autoPlayConfig.resumeDelay);
        
        console.log('Hero auto-play restarted');
    }

    /**
     * Maneja interacciones del usuario con el carousel
     * Implementa patrón Command para encapsular acciones
     * @param {Function} action - Acción a ejecutar
     */
    handleUserInteraction(action) {
        this.autoPlayState.userInteracting = true;
        
        // Ejecutar acción
        if (typeof action === 'function') {
            action();
        }
        
        // Reiniciar auto-play después de la interacción
        this.restartHeroAutoPlay();
        
        // Resetear flag de interacción
        setTimeout(() => {
            this.autoPlayState.userInteracting = false;
        }, this.autoPlayConfig.resumeDelay);
    }

    setupCarouselControls() {
        this.prevBtn = this.container.querySelector('.carousel-prev, .hero-prev');
        this.nextBtn = this.container.querySelector('.carousel-next, .hero-next');
        this.indicators = this.container.querySelector('.hero-indicators');
    }
    
    applyTrackStyles() {
        if (this.track) {
            this.track.style.display = 'flex';
            // Smoother and slightly faster transition for all standard carousels (incl. categories)
            this.track.style.transition = 'transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)';
            this.track.style.willChange = 'transform';
        }
    }
    
    setupInfiniteScroll() {
        if (!this.options.infiniteScroll || this.originalItems.length === 0) return;
        if (this.track.dataset.infiniteSetup === 'true') {
            // Already set up; avoid duplicating clones
            return;
        }
        
        // Clear existing items
        this.track.innerHTML = '';
        
        // Create multiple clones for seamless infinite scrolling
        // Ensure enough buffer: at least itemsToShow + 2 on each side
        const minBuffer = (this.itemsToShow || 1) + 2;
        const clonesNeeded = Math.max(minBuffer, Math.ceil(this.originalItems.length / 2));
        
        // Helper: deep-clone a node and strip duplicate IDs to avoid CSS/JS conflicts
        const cloneAndSanitize = (node) => {
            const cloned = node.cloneNode(true);
            const stack = [cloned];
            while (stack.length) {
                const el = stack.pop();
                if (el.nodeType === 1) {
                    if (el.id) el.removeAttribute('id');
                    el.setAttribute('data-clone', 'true');
                    // prevent nested carousels/scripts from binding again on clones
                    if (el.dataset && el.dataset.carouselInitialized) delete el.dataset.carouselInitialized;
                    for (let i = 0; i < el.children.length; i++) stack.push(el.children[i]);
                }
            }
            return cloned;
        };

        // Add clones at the beginning (reverse order)
        for (let i = 0; i < clonesNeeded; i++) {
            if (!this.originalItems.length) break;
            const cloneIndexRaw = (this.originalItems.length - 1 - i);
            const cloneIndex = ((cloneIndexRaw % this.originalItems.length) + this.originalItems.length) % this.originalItems.length;
            const src = this.originalItems[cloneIndex];
            if (!src) continue;
            const clone = cloneAndSanitize(src);
            this.track.appendChild(clone);
        }
        
        // Add all original items
        this.originalItems.forEach(item => {
            if (!item) return;
            this.track.appendChild(cloneAndSanitize(item));
        });
        
        // Add clones at the end
        for (let i = 0; i < clonesNeeded; i++) {
            if (!this.originalItems.length) break;
            const src = this.originalItems[i % this.originalItems.length];
            if (!src) continue;
            const clone = cloneAndSanitize(src);
            this.track.appendChild(clone);
        }
        
        // Update items array and set initial position
        this.items = [...this.track.children];
        this._clonesPadding = clonesNeeded; // store padding of clones at each side
        this.currentIndex = clonesNeeded; // Start at first real item
        this.track.dataset.infiniteSetup = 'true';
    }

    // Calculate itemsToShow based on breakpoints and container width
    updateItemsToShow() {
        // Default
        let items = this.options.itemsToShow || 1;
        try {
            const width = this.container.getBoundingClientRect().width || window.innerWidth;
            const bps = this.options.breakpoints || {};
            const sorted = Object.keys(bps).map(n => parseInt(n, 10)).filter(n => !isNaN(n)).sort((a,b)=>a-b);
            for (const bp of sorted) {
                if (width >= bp && bps[bp] && bps[bp].itemsToShow) {
                    items = bps[bp].itemsToShow;
                }
            }
        } catch (_) {}
        this.itemsToShow = Math.max(1, items);
    }

    // Compute step width (item width + gap) safely
    _getStepWidth() {
        if (!this.items || this.items.length === 0) return 0;
        const first = this.items[Math.min(this.currentIndex, this.items.length - 1)] || this.items[0];
        const rect = first.getBoundingClientRect();
        const gap = Number(this.options.gap || 0);
        // Use rect.width; margin gaps are handled by transform offsets using gap
        return rect.width + gap;
    }

    // Apply transform according to currentIndex
    updateView() {
        if (!this.track || !this.items || this.items.length === 0) return;
        // Apply item sizing
        const gap = Number(this.options.gap || 0);
        const totalGap = gap * (this.itemsToShow - 1);
        const containerWidth = this.container.getBoundingClientRect().width;
        const itemWidth = Math.max(1, (containerWidth - totalGap) / this.itemsToShow);

        this.items.forEach((item, idx) => {
            item.style.flex = `0 0 ${itemWidth}px`;
            // Apply right margin to all except last visual slot; simpler to apply to all and rely on container overflow hidden
            item.style.marginRight = `${gap}px`;
        });

        const step = itemWidth + gap;
        const offsetRaw = Math.max(0, Math.min(this.currentIndex, this.items.length - 1)) * step;
        const offset = Math.round(offsetRaw); // avoid subpixel jitter
        this.track.style.transform = `translate3d(${-offset}px, 0, 0)`;
        this.updateButtons();
    }

    // Seamless reset when crossing clone boundaries
    handleInfiniteReset() {
        if (!this.options.infiniteScroll || !this._clonesPadding) return;
        const pad = this._clonesPadding;
        const realLen = this.originalItems.length;
        if (!realLen) return;
        // Normalize first-visible index into [0, realLen-1]
        const firstVisible = this.currentIndex - pad;
        const mod = ((firstVisible % realLen) + realLen) % realLen; // safe modulo
        const normalizedIndex = pad + mod;
        const needsSnap = (normalizedIndex !== this.currentIndex);
        const newIndex = normalizedIndex;

        if (!needsSnap) return;

        // Disable transition, snap, then restore transition next frame
        const prevTransition = this.track.style.transition;
        this.track.style.transition = 'none';
        this.currentIndex = newIndex;
        this.updateView();
        // Force reflow
        void this.track.offsetWidth;
        // Restore transition asynchronously
        requestAnimationFrame(() => {
            this.track.style.transition = prevTransition || 'transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)';
        });
    }
    
    setupEventListeners() {
        if (this.prevBtn) {
            Utils.addEvent(this.prevBtn, 'click', () => {
                console.log('Previous button clicked for:', this.container.id || this.container.className);
                
                if (this.carouselType === 'hero') {
                    // Para hero carousel, usar sistema de interacción profesional
                    this.handleUserInteraction(() => {
                        this.prev();
                    });
                } else {
                    this.prev();
                }
            });
        }
        
        if (this.nextBtn) {
            Utils.addEvent(this.nextBtn, 'click', () => {
                console.log('Next button clicked for:', this.container.id || this.container.className);
                
                if (this.carouselType === 'hero') {
                    // Para hero carousel, usar sistema de interacción profesional
                    this.handleUserInteraction(() => {
                        this.next();
                    });
                } else {
                    this.next();
                }
            });
        }
        
        if (this.indicators) {
            const indicatorButtons = this.indicators.querySelectorAll('.hero-indicator');
            indicatorButtons.forEach((btn, index) => {
                Utils.addEvent(btn, 'click', () => this.goToSlide(index));
            });
        }
        
        // Handle window resize
        Utils.addEvent(window, 'resize', Utils.debounce(() => {
            this.updateItemsToShow();
            this.updateView();
        }, 250));
        
        // When using infinite scroll, snap exactly on the end of the CSS transition to avoid flicker
        if (this.options.infiniteScroll && this.track) {
            Utils.addEvent(this.track, 'transitionend', (e) => {
                if (e.propertyName && e.propertyName !== 'transform') return;
                this.handleInfiniteReset();
                this.isTransitioning = false;
            });
        }

        // Pause autoplay on hover
        if (this.options.autoPlay) {
            Utils.addEvent(this.container, 'mouseenter', () => this.pauseAutoPlay());
            Utils.addEvent(this.container, 'mouseleave', () => this.startAutoPlay());
        }
        
        // Handle touch events for mobile
        this.setupTouchEvents();
    }
    
    setupTouchEvents() {
        let startX = 0;
        let startY = 0;
        let isDragging = false;
        
        Utils.addEvent(this.track, 'touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            this.pauseAutoPlay();
        }, { passive: true });
        
        Utils.addEvent(this.track, 'touchmove', (e) => {
            if (!isDragging) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = startX - currentX;
            const diffY = startY - currentY;
            
            // If horizontal swipe is more significant than vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
                e.preventDefault();
            }
        });
        
        Utils.addEvent(this.track, 'touchend', (e) => {
            if (!isDragging) return;
            
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
            
            isDragging = false;
            
            if (this.options.autoPlay) {
                this.startAutoPlay();
            }
        }, { passive: true });
    }
    
    updateItemsToShow() {
        const width = window.innerWidth;
        let newItemsToShow = this.options.itemsToShow;
        
        // Apply breakpoints
        Object.keys(this.options.breakpoints)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .forEach(breakpoint => {
                if (width >= parseInt(breakpoint)) {
                    newItemsToShow = this.options.breakpoints[breakpoint].itemsToShow;
                }
            });
        
        this.itemsToShow = Math.min(newItemsToShow, this.items.length);
    }
    
    updateView() {
        if (!this.track || this.items.length === 0) return;
        
        // For hero carousel, handle differently
        if (this.track.classList.contains('hero-slider')) {
            this.updateHeroView();
            return;
        }
        
        // Check if this is a categories carousel
        const containerId = (this.container && this.container.id) ? this.container.id : '';
        const isCategoriesCarousel = this.container.classList.contains('categories-carousel') || 
                                   containerId.includes('categories') ||
                                   this.track.classList.contains('categories-track');
        
        if (isCategoriesCarousel) {
            // For categories, compute width and gap from DOM to stay in sync with CSS
            const firstItem = this.items[0];
            const styles = window.getComputedStyle(this.track);
            const rawGap = styles.columnGap || styles.gap || '24px';
            const gap = parseInt(rawGap, 10) || 24;
            const categoryWidth = firstItem ? firstItem.offsetWidth : 150;
            
            // Only limit bounds if NOT using infinite scroll
            if (!this.options.infiniteScroll) {
                // Calculate the safe bounds for categories
                const totalItems = this.items.length;
                const maxSafeIndex = Math.max(0, totalItems - this.itemsToShow);
                
                // Ensure currentIndex doesn't go beyond safe bounds
                this.currentIndex = Math.min(this.currentIndex, maxSafeIndex);
                this.currentIndex = Math.max(0, this.currentIndex);
            }
            
            const translateX = -(this.currentIndex * (categoryWidth + gap));
            this.track.style.transform = `translateX(${translateX}px)`;
        } else {
            // For other carousels, calculate dynamic width
            const containerWidth = this.track.parentElement.offsetWidth;
            const totalGap = (this.itemsToShow - 1) * this.options.gap;
            const itemWidth = (containerWidth - totalGap) / this.itemsToShow;
            
            // Set item widths and styles
            this.items.forEach((item, index) => {
                item.style.flex = `0 0 ${itemWidth}px`;
                item.style.marginRight = index < this.items.length - 1 ? `${this.options.gap}px` : '0';
            });
            
            // Update transform
            const translateX = -(this.currentIndex * (itemWidth + this.options.gap));
            this.track.style.transform = `translateX(${translateX}px)`;
        }
        
        // Update button states
        this.updateButtons();
    }
    
    updateViewNoTransition() {
        if (!this.track || this.items.length === 0) return;

        // Safely detect categories carousel
        const containerId2 = (this.container && this.container.id) ? this.container.id : '';
        const isCategoriesCarousel = this.container.classList.contains('categories-carousel') ||
                                     containerId2.includes('categories') ||
                                     this.track.classList.contains('categories-track');

        // Temporarily disable transition
        this.track.style.transition = 'none';

        if (isCategoriesCarousel) {
            // Compute width and gap from DOM to stay in sync with CSS
            const firstItem = this.items[0];
            const styles = window.getComputedStyle(this.track);
            const rawGap = styles.columnGap || styles.gap || '24px';
            const gap = parseInt(rawGap, 10) || 24;
            const categoryWidth = firstItem ? firstItem.offsetWidth : 150;

            if (!this.options.infiniteScroll) {
                const totalItems = this.items.length;
                const maxSafeIndex = Math.max(0, totalItems - this.itemsToShow);
                this.currentIndex = Math.min(this.currentIndex, maxSafeIndex);
                this.currentIndex = Math.max(0, this.currentIndex);
            }

            const translateX = -(this.currentIndex * (categoryWidth + gap));
            this.track.style.transform = `translateX(${translateX}px)`;
        } else {
            // For other carousels, calculate dynamic width
            const containerWidth = this.track.parentElement.offsetWidth;
            const totalGap = (this.itemsToShow - 1) * this.options.gap;
            const itemWidth = (containerWidth - totalGap) / this.itemsToShow;

            // Set item widths
            this.items.forEach((item, index) => {
                item.style.flex = `0 0 ${itemWidth}px`;
                item.style.marginRight = index < this.items.length - 1 ? `${this.options.gap}px` : '0';
            });

            const translateX = -(this.currentIndex * (itemWidth + this.options.gap));
            this.track.style.transform = `translateX(${translateX}px)`;
        }

        // Force reflow and re-enable transition
        this.track.offsetHeight; // reflow
        this.track.style.transition = 'transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)';

        this.updateButtons();
    }
    
    handleInfiniteReset() {
        if (!this.options.infiniteScroll) return;
        
        const clonesNeeded = Math.max(4, Math.ceil(this.originalItems.length / 2));
        const totalWithClones = this.items.length;
        const startReal = clonesNeeded;
        const endRealExclusive = clonesNeeded + this.originalItems.length; // exclusive upper bound
        
        // Reset position if we're in clone territory
        if (this.currentIndex < startReal) {
            // Too far left (in left clones), jump forward by originals count
            this.currentIndex += this.originalItems.length;
            this.updateViewNoTransition();
        } else if (this.currentIndex >= endRealExclusive) {
            // Too far right (in right clones), jump back by originals count
            this.currentIndex -= this.originalItems.length;
            this.updateViewNoTransition();
        }
    }
    
    updateHeroView() {
        this.items.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentIndex);
        });
        
        // Update indicators
        if (this.indicators) {
            const indicatorButtons = this.indicators.querySelectorAll('.hero-indicator');
            indicatorButtons.forEach((btn, index) => {
                btn.classList.toggle('active', index === this.currentIndex);
            });
        }
        
        this.updateButtons();
    }
    
    updateButtons() {
        const maxIndex = this.getMaxIndex();
        
        if (this.prevBtn) {
            // For infinite scroll, buttons are always enabled
            this.prevBtn.disabled = this.options.infiniteScroll ? false : (!this.options.loop && this.currentIndex === 0);
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = this.options.infiniteScroll ? false : (!this.options.loop && this.currentIndex >= maxIndex);
        }
    }
    
    getMaxIndex() {
        if (this.track.classList.contains('hero-slider')) {
            return this.originalItems.length > 0 ? this.originalItems.length - 1 : this.items.length - 1;
        }
        
        // Check if this is a categories carousel
        const containerId2 = (this.container && this.container.id) ? this.container.id : '';
        const isCategoriesCarousel = this.container.classList.contains('categories-carousel') || 
                                   containerId2.includes('categories') ||
                                   this.track.classList.contains('categories-track');
        
        const totalItems = this.originalItems.length > 0 ? this.originalItems.length : this.items.length;
        
        if (isCategoriesCarousel) {
            // For categories with infinite scroll, allow unlimited scrolling
            if (this.options.infiniteScroll) {
                return this.items.length - 1; // Allow scrolling through all cloned items
            } else {
                // For categories without infinite scroll, ensure we never scroll past what we can show
                return Math.max(0, totalItems - this.itemsToShow);
            }
        } else {
            // For other carousels, use standard calculation
            return Math.max(0, totalItems - this.itemsToShow);
        }
    }
    
    prev() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        if (this.carouselType === 'hero') {
            // Hero carousel usa fade effect y auto-play profesional
            const prevIndex = this.options.loop 
                ? (this.currentIndex - 1 + this.items.length) % this.items.length
                : Math.max(this.currentIndex - 1, 0);
            
            this.moveToSlideHero(prevIndex);
            
            setTimeout(() => { 
                this.isTransitioning = false; 
            }, 800); // Coincide con duración de transición CSS
            
        } else if (this.options.infiniteScroll) {
            this.currentIndex--;
            this.updateView();
            // isTransitioning will be released on transitionend
        } else {
            const maxIndex = this.getMaxIndex();
            
            if (this.currentIndex > 0) {
                this.currentIndex -= this.options.itemsToScroll;
            } else if (this.options.loop) {
                this.currentIndex = maxIndex;
            }
            
            this.currentIndex = Math.max(0, this.currentIndex);
            this.updateView();
            this.isTransitioning = false;
        }
    }
    
    next() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        if (this.carouselType === 'hero') {
            // Hero carousel usa fade effect y auto-play profesional
            const nextIndex = this.options.loop 
                ? (this.currentIndex + 1) % this.items.length
                : Math.min(this.currentIndex + 1, this.items.length - 1);
            
            this.moveToSlideHero(nextIndex);
            
            setTimeout(() => { 
                this.isTransitioning = false; 
            }, 800); // Coincide con duración de transición CSS
            
        } else if (this.options.infiniteScroll) {
            this.currentIndex++;
            this.updateView();
            // isTransitioning will be released on transitionend
        } else {
            const maxIndex = this.getMaxIndex();
            
            if (this.currentIndex < maxIndex) {
                this.currentIndex += this.options.itemsToScroll;
            } else if (this.options.loop) {
                this.currentIndex = 0;
            }
            
            this.currentIndex = Math.min(maxIndex, this.currentIndex);
            this.updateView();
            this.isTransitioning = false;
        }
    }
    
    // Movimiento específico para hero carousel (fade effect)
    moveToSlideHero(index) {
        if (!this.items || this.items.length === 0) return;
        
        // Asegurar que el índice esté en rango
        if (index < 0) index = this.items.length - 1;
        if (index >= this.items.length) index = 0;
        
        console.log(`Hero carousel moving to slide ${index}`);
        
        // Aplicar transición fade profesional
        this.items.forEach((slide, i) => {
            if (i === index) {
                // Slide activo
                slide.style.opacity = '1';
                slide.style.zIndex = '2';
                slide.classList.add('active');
            } else {
                // Slides inactivos
                slide.style.opacity = '0';
                slide.style.zIndex = '1';
                slide.classList.remove('active');
            }
        });
        
        this.currentIndex = index;
        this.updateHeroIndicators();
        
        // Disparar evento personalizado para extensibilidad
        this.dispatchSlideChangeEvent(index);
    }

    /**
     * Actualiza indicadores del hero carousel
     * Implementa principio de responsabilidad única
     */
    updateHeroIndicators() {
        if (!this.indicators) return;
        
        const indicatorButtons = this.indicators.querySelectorAll('.hero-indicator');
        indicatorButtons.forEach((indicator, index) => {
            if (index === this.currentIndex) {
                indicator.classList.add('active');
                indicator.setAttribute('aria-selected', 'true');
            } else {
                indicator.classList.remove('active');
                indicator.setAttribute('aria-selected', 'false');
            }
        });
        
        console.log('Hero indicators updated, current slide:', this.currentIndex);
    }

    /**
     * Dispara evento personalizado de cambio de slide
     * Permite extensibilidad y integración con otros sistemas
     * @param {number} slideIndex - Índice del slide actual
     */
    dispatchSlideChangeEvent(slideIndex) {
        const event = new CustomEvent('heroSlideChange', {
            detail: {
                slideIndex,
                totalSlides: this.items.length,
                carouselId: this.container.id
            }
        });
        
        this.container.dispatchEvent(event);
    }
    
    goToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) return;
        
        this.isTransitioning = true;
        
        if (this.carouselType === 'hero') {
            // Para hero carousel, usar el sistema de manejo de interacciones
            this.handleUserInteraction(() => {
                this.moveToSlideHero(index);
            });
            
            setTimeout(() => { 
                this.isTransitioning = false; 
            }, 800);
        } else {
            this.currentIndex = Math.max(0, Math.min(index, this.getMaxIndex()));
            this.updateView();
            
            setTimeout(() => { 
                this.isTransitioning = false; 
            }, 500);
        }
    }
    
    startAutoPlay() {
        if (!this.options.autoPlay) return;
        
        this.autoPlayTimer = setInterval(() => {
            this.next();
        }, this.options.autoPlayInterval);
    }
    
    pauseAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
    
    destroy() {
        this.pauseAutoPlay();
        
        // Remove event listeners
        if (this.prevBtn) {
            this.prevBtn.replaceWith(this.prevBtn.cloneNode(true));
        }
        if (this.nextBtn) {
            this.nextBtn.replaceWith(this.nextBtn.cloneNode(true));
        }
        
        // Reset styles
        if (this.track) {
            this.track.style.transform = '';
            this.track.style.transition = '';
        }
        
        this.items.forEach(item => {
            item.style.flex = '';
            item.style.marginRight = '';
        });
    }
}

// Función para inicializar carruseles de manera segura
function initializeCarousels() {
    console.log('Initializing carousels...');
    
    // Verificar que Utils esté disponible
    if (typeof Utils === 'undefined' || !Utils.$) {
        console.error('Utils not available, retrying in 100ms...');
        setTimeout(initializeCarousels, 100);
        return;
    }
    
    const carouselConfigs = [
        {
            selector: '#categoriesCarousel',
            name: 'categories',
            options: {
                itemsToShow: 2,
                itemsToScroll: 1,
                gap: 24,
                loop: true,
                infiniteScroll: true,
                breakpoints: {
                    480: { itemsToShow: 3 },
                    768: { itemsToShow: 4 },
                    1024: { itemsToShow: 5 },
                    1200: { itemsToShow: 6 }
                }
            }
        },
        {
            selector: '#featuredProductsCarousel',
            name: 'featuredProducts',
            options: {
                autoPlay: false,
                infiniteScroll: true,
                itemsToShow: 1,
                itemsToScroll: 1,
                gap: 24,
                breakpoints: {
                    480: { itemsToShow: 2 },
                    768: { itemsToShow: 3 },
                    1024: { itemsToShow: 4 }
                }
            }
        },
        {
            selector: '#bestSellersCarousel',
            name: 'bestSellers',
            options: {
                autoPlay: false,
                itemsToShow: 1,
                itemsToScroll: 1,
                gap: 24,
                breakpoints: {
                    480: { itemsToShow: 2 },
                    768: { itemsToShow: 3 },
                    1024: { itemsToShow: 4 }
                }
            }
        }
    ];
    
    const carouselInstances = {};
    let successCount = 0;
    
    carouselConfigs.forEach(config => {
        const element = Utils.$(config.selector);
        if (element) {
            try {
                const carousel = new Carousel(config.selector, config.options);
                if (carousel && carousel.init !== false) {
                    carouselInstances[config.name] = carousel;
                    console.log(`✓ ${config.name} carousel created successfully`);
                    successCount++;
                } else {
                    console.warn(`✗ ${config.name} carousel initialization failed`);
                }
            } catch (error) {
                console.error(`✗ Error creating ${config.name} carousel:`, error);
            }
        } else {
            console.warn(`✗ Element not found for ${config.name} carousel: ${config.selector}`);
        }
    });
    
    // Store carousel instances globally for access
    window.Carousels = carouselInstances;
    
    console.log(`Carousel initialization complete: ${successCount}/${carouselConfigs.length} carousels initialized successfully`);
    
    return successCount > 0;
}

// Inicializar cuando DOM y Utils estén listos
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Pequeño delay para asegurar que Utils esté disponible
        setTimeout(initializeCarousels, 100);
    });
} else {
    // DOM ya está listo
    setTimeout(initializeCarousels, 100);
}

// Export Carousel class
window.Carousel = Carousel;
