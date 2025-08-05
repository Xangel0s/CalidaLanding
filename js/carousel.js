// Carousel functionality for Credicálidda website

class Carousel {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? Utils.$(container) : container;
        if (!this.container) return;
        
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
        
        this.init();
    }
    
    init() {
        this.setupElements();
        
        if (!this.track || !this.items.length) {
            console.warn('Carousel initialization failed: track or items not found in:', this.container.id || this.container.className);
            return;
        }
        
        // For infinite scroll carousels, setup clones first
        if (this.options.infiniteScroll) {
            this.setupInfiniteScroll();
        }
        
        this.setupEventListeners();
        this.updateItemsToShow();
        this.updateView();
        
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
    }
    
    setupElements() {
        // Buscar el track con selectores más específicos incluyendo IDs
        this.track = this.container.querySelector('.categories-track, .hero-slider, .best-sellers-track, #categoriesTrack, #featuredProductsTrack, #bestSellersTrack');
        
        if (!this.track) {
            console.warn('Track not found in carousel:', this.container.id || this.container.className);
            return;
        }
        
        this.items = [...this.track.children];
        this.originalItems = [...this.items]; // Store original items for infinite scroll
        this.prevBtn = this.container.querySelector('.carousel-prev, .hero-prev');
        this.nextBtn = this.container.querySelector('.carousel-next, .hero-next');
        this.indicators = this.container.querySelector('.hero-indicators');
        
        if (this.items.length === 0) {
            console.warn('No items found in track:', this.track);
            return;
        }
        
        // Set up track styles
        this.track.style.display = 'flex';
        this.track.style.transition = 'transform 0.5s ease-in-out';
        
        console.log('Carousel initialized:', this.container.id || this.container.className, 'with', this.items.length, 'items');
    }
    
    setupInfiniteScroll() {
        if (!this.options.infiniteScroll || this.originalItems.length === 0) return;
        
        // Clear existing items
        this.track.innerHTML = '';
        
        // Create multiple clones for seamless infinite scrolling
        const clonesNeeded = Math.max(4, Math.ceil(this.originalItems.length / 2));
        
        // Add clones at the beginning (reverse order)
        for (let i = 0; i < clonesNeeded; i++) {
            const cloneIndex = (this.originalItems.length - 1 - i) % this.originalItems.length;
            const clone = this.originalItems[cloneIndex].cloneNode(true);
            this.track.appendChild(clone);
        }
        
        // Add all original items
        this.originalItems.forEach(item => {
            this.track.appendChild(item.cloneNode(true));
        });
        
        // Add clones at the end
        for (let i = 0; i < clonesNeeded; i++) {
            const clone = this.originalItems[i % this.originalItems.length].cloneNode(true);
            this.track.appendChild(clone);
        }
        
        // Update items array and set initial position
        this.items = [...this.track.children];
        this.currentIndex = clonesNeeded; // Start at first real item
    }
    
    setupEventListeners() {
        if (this.prevBtn) {
            Utils.addEvent(this.prevBtn, 'click', () => {
                console.log('Previous button clicked for:', this.container.id || this.container.className);
                this.prev();
            });
        }
        
        if (this.nextBtn) {
            Utils.addEvent(this.nextBtn, 'click', () => {
                console.log('Next button clicked for:', this.container.id || this.container.className);
                this.next();
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
        
        // Calculate item width
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
        
        // Update button states
        this.updateButtons();
    }
    
    updateViewNoTransition() {
        if (!this.track || this.items.length === 0) return;
        
        const containerWidth = this.track.parentElement.offsetWidth;
        const totalGap = (this.itemsToShow - 1) * this.options.gap;
        const itemWidth = (containerWidth - totalGap) / this.itemsToShow;
        
        // Temporarily disable transition
        this.track.style.transition = 'none';
        
        // Set item widths
        this.items.forEach((item, index) => {
            item.style.flex = `0 0 ${itemWidth}px`;
            item.style.marginRight = index < this.items.length - 1 ? `${this.options.gap}px` : '0';
        });
        
        // Update transform
        const translateX = -(this.currentIndex * (itemWidth + this.options.gap));
        this.track.style.transform = `translateX(${translateX}px)`;
        
        // Force reflow and re-enable transition
        this.track.offsetHeight;
        this.track.style.transition = 'transform 0.5s ease-in-out';
        
        this.updateButtons();
    }
    
    handleInfiniteReset() {
        if (!this.options.infiniteScroll) return;
        
        const clonesNeeded = Math.max(4, Math.ceil(this.originalItems.length / 2));
        const totalWithClones = this.items.length;
        const endCloneSection = totalWithClones - clonesNeeded;
        
        // Reset position if we're in clone territory
        if (this.currentIndex <= 1) {
            // We're too far left, jump to equivalent position on the right
            this.currentIndex = this.currentIndex + this.originalItems.length;
            this.updateViewNoTransition();
        } else if (this.currentIndex >= endCloneSection - 1) {
            // We're too far right, jump to equivalent position on the left
            this.currentIndex = this.currentIndex - this.originalItems.length;
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
        
        const totalItems = this.originalItems.length > 0 ? this.originalItems.length : this.items.length;
        return Math.max(0, totalItems - this.itemsToShow);
    }
    
    prev() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        if (this.options.infiniteScroll) {
            this.currentIndex--;
            this.updateView();
            
            // Check for reset after transition
            setTimeout(() => {
                this.handleInfiniteReset();
                this.isTransitioning = false;
            }, 500);
        } else {
            if (this.currentIndex > 0) {
                this.currentIndex -= this.options.itemsToScroll;
            } else if (this.options.loop) {
                this.currentIndex = this.getMaxIndex();
            }
            
            this.currentIndex = Math.max(0, this.currentIndex);
            this.updateView();
            this.isTransitioning = false;
        }
    }
    
    next() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        if (this.options.infiniteScroll) {
            this.currentIndex++;
            this.updateView();
            
            // Check for reset after transition
            setTimeout(() => {
                this.handleInfiniteReset();
                this.isTransitioning = false;
            }, 500);
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
    
    goToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) return;
        
        this.currentIndex = Math.max(0, Math.min(index, this.getMaxIndex()));
        this.updateView();
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
    
    // Hero carousel
    if (Utils.$('#heroSlider')) {
        const heroCarousel = new Carousel('#heroSlider', {
            autoPlay: true,
            autoPlayInterval: 5000,
            loop: true,
            itemsToShow: 1
        });
        console.log('Hero carousel created');
    }
    
    // Categories carousel
    if (Utils.$('#categoriesCarousel')) {
        const categoriesCarousel = new Carousel('#categoriesCarousel', {
            itemsToShow: 2,
            itemsToScroll: 1,
            gap: 24,
            breakpoints: {
                480: { itemsToShow: 3 },
                768: { itemsToShow: 4 },
                1024: { itemsToShow: 5 },
                1200: { itemsToShow: 6 }
            }
        });
        console.log('Categories carousel created');
    }
    
    // Featured Products Carousel (Lo más destacado)
    if (Utils.$('#featuredProductsCarousel')) {
        const featuredProductsCarousel = new Carousel('#featuredProductsCarousel', {
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
        });
        console.log('Featured products carousel created');
    }
    
    // Best Sellers Carousel
    if (Utils.$('#bestSellersCarousel')) {
        const bestSellersCarousel = new Carousel('#bestSellersCarousel', {
            autoPlay: false,
            itemsToShow: 1,
            itemsToScroll: 1,
            gap: 24,
            breakpoints: {
                480: { itemsToShow: 2 },
                768: { itemsToShow: 3 },
                1024: { itemsToShow: 4 }
            }
        });
        console.log('Best sellers carousel created');
    }
    
    // Store carousel instances globally for access
    window.Carousels = {
        hero: heroCarousel,
        categories: categoriesCarousel,
        featuredProducts: featuredProductsCarousel,
        bestSellers: bestSellersCarousel
    };
    
    console.log('All carousels initialized successfully');
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
