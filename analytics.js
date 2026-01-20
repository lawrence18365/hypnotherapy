// Google Analytics 4 Setup
// Replace 'GA_MEASUREMENT_ID' with your actual Google Analytics 4 Measurement ID

(function() {
    'use strict';
    
    // Configuration
    const GA_MEASUREMENT_ID = 'GA_MEASUREMENT_ID'; // Replace with your actual ID
    
    // Only load analytics in production
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('github.io')) {
        return;
    }
    
    // Load Google Analytics
    function loadGoogleAnalytics() {
        // Create script tag for gtag
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);
        
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID, {
            page_title: document.title,
            page_location: window.location.href
        });
    }
    
    // Track custom events
    function trackEvent(action, category, label, value) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
        }
    }
    
    // Track form submissions
    function trackFormSubmissions() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', function() {
                trackEvent('form_submit', 'engagement', 'contact_form');
            });
        });
    }
    
    // Track external links
    function trackExternalLinks() {
        const links = document.querySelectorAll('a[href^="http"]');
        links.forEach(link => {
            if (!link.href.includes(window.location.hostname)) {
                link.addEventListener('click', function() {
                    trackEvent('click', 'external_link', this.href);
                });
            }
        });
    }
    
    // Track scroll depth
    function trackScrollDepth() {
        let maxScroll = 0;
        const milestones = [25, 50, 75, 90];
        
        window.addEventListener('scroll', function() {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                milestones.forEach(milestone => {
                    if (scrollPercent >= milestone && !window[`scroll_${milestone}_tracked`]) {
                        window[`scroll_${milestone}_tracked`] = true;
                        trackEvent('scroll', 'engagement', `${milestone}_percent`);
                    }
                });
            }
        });
    }
    
    // Initialize analytics when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadGoogleAnalytics();
            trackFormSubmissions();
            trackExternalLinks();
            trackScrollDepth();
        });
    } else {
        loadGoogleAnalytics();
        trackFormSubmissions();
        trackExternalLinks();
        trackScrollDepth();
    }
    
    // Make trackEvent available globally for manual tracking
    window.trackEvent = trackEvent;
})();