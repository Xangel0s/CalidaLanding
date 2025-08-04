// Carousel functionality for Credicálidda website

class Carousel {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? Utils.$(container) : container;
        if (!this.container) return;
        
        this.options = {
            autoPlay: false,
            autoPlayInterval: 5000,
            loop: true,
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
        
        this.init();
    }
    
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.updateItemsToShow();
        this.updateView();
        
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
    }
    
    setupElements() {
        this.track = this.container.querySelector('.categories-track, .products-track, .hero-slider, .best-sellers-track');
        this.items = [...this.track.children];
        this.prevBtn = this.container.querySelector('.carousel-prev, .hero-prev');
        this.nextBtn = this.container.querySelector('.carousel-next, .hero-next');
        this.indicators = this.container.querySelector('.hero-indicators');
        
        if (!this.track || this.items.length === 0) return;
        
        // Set up track styles
        this.track.style.display = 'flex';
        this.track.style.transition = 'transform 0.5s ease-in-out';
    }
    
    setupEventListeners() {
        if (this.prevBtn) {
            Utils.addEvent(this.prevBtn, 'click', () => this.prev());
        }
        
        if (this.nextBtn) {
            Utils.addEvent(this.nextBtn, 'click', () => this.next());
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
        this.items.forEach(item => {
            item.style.flex = `0 0 ${itemWidth}px`;
            item.style.marginRight = `${this.options.gap}px`;
        });
        
        // Remove margin from last visible item
        if (this.items[this.items.length - 1]) {
            this.items[this.items.length - 1].style.marginRight = '0';
        }
        
        // Update transform
        const translateX = -(this.currentIndex * (itemWidth + this.options.gap));
        this.track.style.transform = `translateX(${translateX}px)`;
        
        // Update button states
        this.updateButtons();
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
            this.prevBtn.disabled = !this.options.loop && this.currentIndex === 0;
        }
        
        if (this.nextBtn) {
            this.nextBtn.disabled = !this.options.loop && this.currentIndex >= maxIndex;
        }
    }
    
    getMaxIndex() {
        if (this.track.classList.contains('hero-slider')) {
            return this.items.length - 1;
        }
        return Math.max(0, this.items.length - this.itemsToShow);
    }
    
    prev() {
        if (this.isTransitioning) return;
        
        if (this.currentIndex > 0) {
            this.currentIndex -= this.options.itemsToScroll;
        } else if (this.options.loop) {
            this.currentIndex = this.getMaxIndex();
        }
        
        this.currentIndex = Math.max(0, this.currentIndex);
        this.updateView();
    }
    
    next() {
        if (this.isTransitioning) return;
        
        const maxIndex = this.getMaxIndex();
        
        if (this.currentIndex < maxIndex) {
            this.currentIndex += this.options.itemsToScroll;
        } else if (this.options.loop) {
            this.currentIndex = 0;
        }
        
        this.currentIndex = Math.min(maxIndex, this.currentIndex);
        this.updateView();
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

// Initialize carousels when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Hero carousel
    const heroCarousel = new Carousel('#heroSlider', {
        autoPlay: true,
        autoPlayInterval: 5000,
        loop: true,
        itemsToShow: 1
    });
    
    // Categories carousel
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
    
    // Products carousel
    const productsCarousel = new Carousel('#productsCarousel', {
        itemsToShow: 1,
        itemsToScroll: 1,
        gap: 24,
        breakpoints: {
            480: { itemsToShow: 2 },
            768: { itemsToShow: 3 },
            1024: { itemsToShow: 4 }
        }
    });
    
    // Best Sellers Carousel
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
    
    // Store carousel instances globally for access
    window.Carousels = {
        hero: heroCarousel,
        categories: categoriesCarousel,
        products: productsCarousel,
        bestSellers: bestSellersCarousel
    };
});

// Export Carousel class
window.Carousel = Carousel;
