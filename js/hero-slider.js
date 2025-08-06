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
        
        this.init();
    }
    
    init() {
        if (!this.slider || this.totalSlides === 0) {
            console.warn('Hero slider not found or no slides available');
            console.log('Slider element:', this.slider);
            console.log('Total slides:', this.totalSlides);
            return;
        }
        
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
        
        // Initialize first slide
        this.showSlide(0);
        
        // Start autoplay
        this.startAutoPlay();
    }
    
    setupIndicators() {
        if (!this.indicators || this.indicatorButtons.length === 0) {
            console.warn('Hero slider indicators not found');
            return;
        }
        
        this.indicatorButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToSlide(index);
            });
        });
    }
    
    setupArrows() {
        if (this.prevButton) {
            this.prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.prevSlide();
            });
        }
        
        if (this.nextButton) {
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
    
    showSlide(index) {
        console.log('🔄 Changing from slide', this.currentSlide + 1, 'to slide', index + 1);
        
        // Remove active class from all slides
        this.slides.forEach((slide, i) => {
            const wasActive = slide.classList.contains('active');
            slide.classList.toggle('active', i === index);
            const isNowActive = slide.classList.contains('active');
            
            if (wasActive && !isNowActive) {
                console.log('📤 Slide', i + 1, 'hidden');
            } else if (!wasActive && isNowActive) {
                console.log('📥 Slide', i + 1, 'shown');
                // Get the background image from the slide
                const bgElement = slide.querySelector('.hero-bg');
                if (bgElement) {
                    const bgImage = bgElement.style.backgroundImage;
                    console.log('🖼️ Background image:', bgImage);
                }
            }
        });
        
        // Update indicators
        this.indicatorButtons.forEach((button, i) => {
            button.classList.toggle('active', i === index);
        });
        
        this.currentSlide = index;
        
        console.log('✅ Now showing slide', index + 1, 'of', this.totalSlides);
    }
    
    goToSlide(index) {
        if (index >= 0 && index < this.totalSlides) {
            this.stopAutoPlay();
            this.showSlide(index);
            this.startAutoPlay();
        }
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.totalSlides;
        this.showSlide(nextIndex);
    }
    
    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.showSlide(prevIndex);
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Hero Slider...');
    window.heroSlider = new HeroSlider();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting...');
} else {
    console.log('DOM already loaded, initializing Hero Slider immediately...');
    window.heroSlider = new HeroSlider();
}
