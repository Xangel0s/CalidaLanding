// Hero Slider JavaScript - Dedicated for banner functionality

class HeroSlider {
    constructor() {
        this.slider = document.getElementById('heroSlider');
        this.slides = this.slider ? this.slider.querySelectorAll('.hero-slide') : [];
        this.indicators = document.getElementById('heroIndicators');
        this.indicatorButtons = this.indicators ? this.indicators.querySelectorAll('.hero-indicator') : [];
        this.prevButton = document.getElementById('heroPrev');
        this.nextButton = document.getElementById('heroNext');
        
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5 seconds
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        if (!this.slider || this.totalSlides === 0) {
            console.warn('Hero slider not found or no slides available');
            console.log('Slider element:', this.slider);
            console.log('Total slides:', this.totalSlides);
            return;
        }
        
        // Ensure slides have proper transition inline (guards against CSS overrides)
        this.slides.forEach((s) => {
            s.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
            s.style.willChange = 'transform, opacity';
        });

        console.log('✅ Initializing Hero Slider with', this.totalSlides, 'slides');
        console.log('📋 Slides found:', this.slides);
        console.log('📋 Indicators found:', this.indicatorButtons.length);
        console.log('📋 Prev button:', this.prevButton);
        console.log('📋 Next button:', this.nextButton);
        
        // Check if images are loading
        this.slides.forEach((slide, index) => {
            const bgElement = slide.querySelector('.hero-bg');
            if (bgElement) {
                const bgImage = bgElement.style.backgroundImage;
                console.log(`🖼️ Slide ${index + 1} background:`, bgImage);
            }
        });
        
        // Setup event listeners
        this.setupIndicators();
        this.setupArrows();
        this.setupAutoPlay();
        this.setupTouchEvents();
        
        // Initialize first slide (set active without animation)
        this.slides.forEach((s, i) => {
            s.classList.remove('enter-left','enter-right','exit-left','exit-right','active');
            if (i === 0) s.classList.add('active');
        });
        this.indicatorButtons.forEach((btn, i) => {
            const active = i === 0;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        this.currentSlide = 0;
        
        // Start autoplay
        this.startAutoPlay();
    }
    
    setupIndicators() {
        if (!this.indicators || this.indicatorButtons.length === 0) {
            console.warn('Hero slider indicators not found');
            return;
        }
        
        this.indicatorButtons.forEach((button, index) => {
            // Accessibility attributes
            button.setAttribute('role', 'button');
            button.setAttribute('aria-label', `Ir al banner ${index + 1}`);
            button.setAttribute('aria-selected', index === this.currentSlide ? 'true' : 'false');
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const direction = index > this.currentSlide ? 'next' : 'prev';
                this.goToSlide(index, direction);
            });
        });
    }
    
    setupArrows() {
        if (this.prevButton) {
            this.prevButton.setAttribute('aria-label', 'Banner anterior');
            this.prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.prevSlide();
            });
        }
        
        if (this.nextButton) {
            this.nextButton.setAttribute('aria-label', 'Siguiente banner');
            this.nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextSlide();
            });
        }
    }
    
    setupAutoPlay() {
        // Pause autoplay on hover
        this.slider.addEventListener('mouseenter', () => {
            this.stopAutoPlay();
        });
        
        this.slider.addEventListener('mouseleave', () => {
            this.startAutoPlay();
        });
        
        // Pause autoplay when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoPlay();
            } else {
                this.startAutoPlay();
            }
        });
    }
    
    setupTouchEvents() {
        let startX = 0;
        let endX = 0;
        
        this.slider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });
        
        this.slider.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;
            
            if (Math.abs(diffX) > 50) { // Minimum swipe distance
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        });
    }
    
    showSlide(index, direction = 'next') {
        console.log('🔄 Changing from slide', this.currentSlide + 1, 'to slide', index + 1);
        if (index === this.currentSlide) return;
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const current = this.slides[this.currentSlide];
        const next = this.slides[index];
        if (!current || !next) { this.isAnimating = false; return; }

        // Cleanup any transient classes
        [current, next].forEach(s => s.classList.remove('enter-left','enter-right','exit-left','exit-right'));

        // Prepare entering direction on next slide
        const enterClass = direction === 'prev' ? 'enter-left' : 'enter-right';
        const exitClass = direction === 'prev' ? 'exit-right' : 'exit-left';
        next.classList.add(enterClass);

        // Force reflow so initial position is applied
        // eslint-disable-next-line no-unused-expressions
        next.offsetWidth;

        // Activate next and animate:
        // 1) current goes to exit side (will move from 0 -> ±100%)
        // 2) next starts at enter side and then we remove enterClass to move to 0
        current.classList.add(exitClass);
        next.classList.add('active');
        // Use double rAF to guarantee style recalc before transition starts
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                next.classList.remove(enterClass);
            });
        });

        const onDone = () => {
            next.removeEventListener('transitionend', onDone);
            // Cleanup
            current.classList.remove('active','exit-left','exit-right');
            next.classList.remove('enter-left','enter-right');

            // Update indicators
            this.indicatorButtons.forEach((button, i) => {
                const active = i === index;
                button.classList.toggle('active', active);
                button.setAttribute('aria-selected', active ? 'true' : 'false');
            });

            this.currentSlide = index;
            this.isAnimating = false;
            console.log('✅ Now showing slide', index + 1, 'of', this.totalSlides);
        };
        next.addEventListener('transitionend', onDone, { once: true });
    }
    
    goToSlide(index, direction = null) {
        if (index >= 0 && index < this.totalSlides) {
            this.stopAutoPlay();
            const dir = direction || (index > this.currentSlide ? 'next' : 'prev');
            this.showSlide(index, dir);
            this.startAutoPlay();
        }
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        this.showSlide(nextIndex, 'next');
    }
    
    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.showSlide(prevIndex, 'prev');
    }
    
    startAutoPlay() {
        this.stopAutoPlay(); // Clear any existing interval
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    // Public methods
    pause() {
        this.stopAutoPlay();
    }
    
    play() {
        this.startAutoPlay();
    }
    
    destroy() {
        this.stopAutoPlay();
        // Remove event listeners if needed
    }
}

// Initialize Hero Slider when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing Hero Slider...');
        window.heroSlider = new HeroSlider();
    });
} else {
    console.log('DOM already loaded, initializing Hero Slider...');
    window.heroSlider = new HeroSlider();
}
