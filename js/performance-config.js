/**
 * Performance Configuration for Credicálidda website
 * Centralized settings for performance optimizations
 */

window.PerformanceConfig = {
    // Animation settings
    animations: {
        enabled: true,
        duration: {
            fast: 150,
            normal: 300,
            slow: 500
        },
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        throttleDelay: 16 // ~60fps
    },
    
    // Lazy loading settings
    lazyLoading: {
        enabled: true,
        threshold: 0.1,
        rootMargin: '50px'
    },
    
    // Scroll optimization
    scroll: {
        throttleDelay: 16,
        useRAF: true
    },
    
    // Error handling
    errorHandling: {
        logThreshold: 0.1, // Only log 10% of non-critical errors
        criticalErrorsAlwaysLog: true
    },
    
    // Resource loading
    resources: {
        preloadCritical: true,
        deferNonCritical: true
    },
    
    // Performance monitoring
    monitoring: {
        enabled: true,
        markLoadEvents: true,
        measureKeyMetrics: true
    },
    
    // Device-specific optimizations
    device: {
        mobile: {
            reduceAnimations: true,
            optimizeImages: true
        },
        tablet: {
            reduceAnimations: false,
            optimizeImages: true
        },
        desktop: {
            reduceAnimations: false,
            optimizeImages: false
        }
    }
};

// Performance utilities
window.PerformanceUtils = {
    // Check if animations should be reduced
    shouldReduceAnimations: () => {
        const config = window.PerformanceConfig;
        if (!config.animations.enabled) return true;
        
        const device = window.Utils?.device;
        if (device?.isMobile()) return config.device.mobile.reduceAnimations;
        if (device?.isTablet()) return config.device.tablet.reduceAnimations;
        
        return config.device.desktop.reduceAnimations;
    },
    
    // Get optimized animation duration
    getAnimationDuration: (type = 'normal') => {
        const config = window.PerformanceConfig;
        if (PerformanceUtils.shouldReduceAnimations()) {
            return config.animations.duration[type] * 0.5; // Reduce by 50%
        }
        return config.animations.duration[type];
    },
    
    // Check if performance monitoring is enabled
    isMonitoringEnabled: () => {
        return window.PerformanceConfig?.monitoring?.enabled ?? true;
    },
    
    // Mark performance event
    mark: (name) => {
        if (PerformanceUtils.isMonitoringEnabled() && window.performance?.mark) {
            window.performance.mark(name);
        }
    },
    
    // Measure performance
    measure: (name, startMark, endMark) => {
        if (PerformanceUtils.isMonitoringEnabled() && window.performance?.measure) {
            window.performance.measure(name, startMark, endMark);
        }
    }
};

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    // Apply device-specific optimizations
    const device = window.Utils?.device;
    if (device?.isMobile()) {
        document.documentElement.classList.add('mobile-optimized');
    } else if (device?.isTablet()) {
        document.documentElement.classList.add('tablet-optimized');
    } else {
        document.documentElement.classList.add('desktop-optimized');
    }
    
    // Mark performance events
    if (PerformanceUtils.isMonitoringEnabled()) {
        PerformanceUtils.mark('performance-config-loaded');
    }
});
