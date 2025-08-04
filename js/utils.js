// Utility functions for the Credicálidda website

// DOM helpers
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Create element helper
const createElement = (tag, className = '', content = '') => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
};

// Add event listener helper
const addEvent = (element, event, handler) => {
    if (element) {
        element.addEventListener(event, handler);
    }
};

// Remove event listener helper
const removeEvent = (element, event, handler) => {
    if (element) {
        element.removeEventListener(event, handler);
    }
};

// Debounce function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Format price helper
const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

// Format number helper
const formatNumber = (number) => {
    return new Intl.NumberFormat('es-PE').format(number);
};

// Local Storage helpers
const storage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error getting from localStorage:', error);
            return null;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting to localStorage:', error);
            return false;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Cookie helpers
const cookies = {
    get: (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    },
    
    set: (name, value, days = 30) => {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = `; expires=${date.toUTCString()}`;
        }
        document.cookie = `${name}=${value}${expires}; path=/`;
    },
    
    remove: (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
};

// URL helpers
const url = {
    getParam: (param) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },
    
    setParam: (param, value) => {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    },
    
    removeParam: (param) => {
        const url = new URL(window.location);
        url.searchParams.delete(param);
        window.history.pushState({}, '', url);
    }
};

// Animation helpers
const animate = {
    fadeIn: (element, duration = 300) => {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        const fade = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.opacity = progress;
                requestAnimationFrame(fade);
            } else {
                element.style.opacity = '1';
            }
        };
        
        requestAnimationFrame(fade);
    },
    
    fadeOut: (element, duration = 300) => {
        const start = performance.now();
        const fade = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.opacity = 1 - progress;
                requestAnimationFrame(fade);
            } else {
                element.style.opacity = '0';
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(fade);
    },
    
    slideUp: (element, duration = 300) => {
        element.style.height = element.scrollHeight + 'px';
        element.style.overflow = 'hidden';
        
        const start = performance.now();
        const slide = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.height = (element.scrollHeight * (1 - progress)) + 'px';
                requestAnimationFrame(slide);
            } else {
                element.style.height = '0px';
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(slide);
    },
    
    slideDown: (element, duration = 300) => {
        element.style.display = 'block';
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        
        const targetHeight = element.scrollHeight;
        
        const start = performance.now();
        const slide = (timestamp) => {
            const elapsed = timestamp - start;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.height = (targetHeight * progress) + 'px';
                requestAnimationFrame(slide);
            } else {
                element.style.height = '';
                element.style.overflow = '';
            }
        };
        
        requestAnimationFrame(slide);
    }
};

// Form validation helpers
const validate = {
    email: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    dni: (dni) => {
        const re = /^\d{8}$/;
        return re.test(dni);
    },
    
    phone: (phone) => {
        const re = /^(\+51|51)?9\d{8}$/;
        return re.test(phone.replace(/\s+/g, ''));
    },
    
    required: (value) => {
        return value && value.toString().trim().length > 0;
    },
    
    minLength: (value, length) => {
        return value && value.toString().trim().length >= length;
    },
    
    maxLength: (value, length) => {
        return value && value.toString().trim().length <= length;
    }
};

// Error handling
const errorHandler = {
    log: (error, context = '') => {
        console.error(`Error${context ? ` in ${context}` : ''}:`, error);
        
        // In production, you might want to send errors to a logging service
        if (window.location.hostname !== 'localhost') {
            // Send to analytics or error tracking service
        }
    },
    
    show: (message, type = 'error') => {
        // Create toast notification
        const toast = createElement('div', `toast toast-${type}`, message);
        document.body.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
};

// Loading state helpers
const loading = {
    show: (element) => {
        if (element) {
            element.classList.add('loading');
            element.disabled = true;
        }
    },
    
    hide: (element) => {
        if (element) {
            element.classList.remove('loading');
            element.disabled = false;
        }
    }
};

// Device detection
const device = {
    isMobile: () => window.innerWidth <= 768,
    isTablet: () => window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: () => window.innerWidth > 1024,
    isTouchDevice: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0
};

// Scroll helpers
const scroll = {
    to: (element, duration = 500) => {
        const target = typeof element === 'string' ? $(element) : element;
        if (!target) return;
        
        const start = window.pageYOffset;
        const targetPosition = target.offsetTop - 100; // Offset for fixed header
        const distance = targetPosition - start;
        const startTime = performance.now();
        
        const animation = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const ease = progress * (2 - progress);
            
            window.scrollTo(0, start + distance * ease);
            
            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        };
        
        requestAnimationFrame(animation);
    },
    
    toTop: () => {
        scroll.to(document.body);
    },
    
    isInViewport: (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Image lazy loading
const lazyLoad = {
    init: () => {
        const images = $$('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    }
};

// Performance monitoring
const performance = {
    mark: (name) => {
        if (window.performance && window.performance.mark) {
            window.performance.mark(name);
        }
    },
    
    measure: (name, startMark, endMark) => {
        if (window.performance && window.performance.measure) {
            window.performance.measure(name, startMark, endMark);
        }
    }
};

// Export utilities for use in other modules
window.Utils = {
    $,
    $$,
    createElement,
    addEvent,
    removeEvent,
    debounce,
    throttle,
    formatPrice,
    formatNumber,
    storage,
    cookies,
    url,
    animate,
    validate,
    errorHandler,
    loading,
    device,
    scroll,
    lazyLoad,
    performance
};
