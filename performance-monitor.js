// Performance Monitoring for Static Website
// Tracks Core Web Vitals and sends to analytics

(function() {
    'use strict';
    
    // Check if we have analytics available
    function isAnalyticsAvailable() {
        return typeof window.gtag !== 'undefined';
    }
    
    // Send performance metric to analytics
    function sendToAnalytics(metricName, value, rating) {
        if (isAnalyticsAvailable()) {
            window.gtag('event', metricName, {
                event_category: 'Web Vitals',
                value: Math.round(value),
                rating: rating,
                non_interaction: true
            });
        }
        
        // Also log to console in development
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
            console.log(`${metricName}: ${value} (${rating})`);
        }
    }
    
    // Get rating for Web Vitals metrics
    function getRating(name, value) {
        const thresholds = {
            FCP: [1800, 3000], // First Contentful Paint
            LCP: [2500, 4000], // Largest Contentful Paint
            FID: [100, 300],   // First Input Delay
            CLS: [0.1, 0.25],  // Cumulative Layout Shift
            INP: [200, 500]    // Interaction to Next Paint
        };
        
        const threshold = thresholds[name];
        if (!threshold) return 'unknown';
        
        if (value <= threshold[0]) return 'good';
        if (value <= threshold[1]) return 'needs-improvement';
        return 'poor';
    }
    
    // Measure First Contentful Paint
    function measureFCP() {
        if ('performance' in window && 'PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        const value = entry.startTime;
                        const rating = getRating('FCP', value);
                        sendToAnalytics('first_contentful_paint', value, rating);
                        observer.disconnect();
                    }
                }
            });
            observer.observe({ entryTypes: ['paint'] });
        }
    }
    
    // Measure Largest Contentful Paint
    function measureLCP() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                const value = lastEntry.startTime;
                const rating = getRating('LCP', value);
                sendToAnalytics('largest_contentful_paint', value, rating);
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }
    
    // Measure First Input Delay
    function measureFID() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.processingStart > entry.startTime) {
                        const value = entry.processingStart - entry.startTime;
                        const rating = getRating('FID', value);
                        sendToAnalytics('first_input_delay', value, rating);
                        observer.disconnect();
                    }
                }
            });
            observer.observe({ entryTypes: ['first-input'] });
        }
    }
    
    // Measure Cumulative Layout Shift
    function measureCLS() {
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
            });
            observer.observe({ entryTypes: ['layout-shift'] });
            
            // Report CLS on page unload
            window.addEventListener('beforeunload', () => {
                const rating = getRating('CLS', clsValue);
                sendToAnalytics('cumulative_layout_shift', clsValue, rating);
            });
        }
    }
    
    // Monitor page load times
    function measurePageLoad() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                    const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
                    
                    sendToAnalytics('page_load_time', loadTime, 'info');
                    sendToAnalytics('dom_content_loaded', domContentLoaded, 'info');
                }
            }, 100);
        });
    }
    
    // Monitor JavaScript errors
    function monitorErrors() {
        window.addEventListener('error', (event) => {
            if (isAnalyticsAvailable()) {
                window.gtag('event', 'exception', {
                    description: event.message,
                    fatal: false,
                    filename: event.filename,
                    lineno: event.lineno
                });
            }
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            if (isAnalyticsAvailable()) {
                window.gtag('event', 'exception', {
                    description: 'Unhandled Promise Rejection: ' + event.reason,
                    fatal: false
                });
            }
        });
    }
    
    // Initialize performance monitoring
    function init() {
        measureFCP();
        measureLCP();
        measureFID();
        measureCLS();
        measurePageLoad();
        monitorErrors();
    }
    
    // Start monitoring when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();