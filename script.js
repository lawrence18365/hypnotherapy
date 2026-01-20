document.addEventListener('DOMContentLoaded', () => {

    // --- Footer Year ---
    document.querySelectorAll('.js-year').forEach((el) => {
        el.textContent = new Date().getFullYear();
    });

    // --- Preloader ---
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = `
        <div class="preloader-content">
            <video autoplay muted playsinline>
                <source src="media/preloader_logo.mp4" type="video/mp4">
            </video>
        </div>
    `;
    document.body.prepend(preloader);
    document.body.classList.add('no-scroll');

    const video = preloader.querySelector('video');
    let preloaderHidden = false;

    function hidePreloader() {
        if (preloaderHidden) return;
        preloaderHidden = true;
        preloader.classList.add('fade-out');
        document.body.classList.remove('no-scroll');
        setTimeout(() => {
            if (preloader.parentNode) preloader.remove();
        }, 600);
    }

    // Hide when video ends
    if (video) video.addEventListener('ended', hidePreloader);
    // Fallback timeout (7s)
    setTimeout(hidePreloader, 7000);
    
    // --- Sticky Nav Logic + Hide on Scroll ---
    const nav = document.querySelector('.nav');
    let lastScrollY = window.scrollY;
    let navHidden = false;

    const updateNavState = () => {
        if (!nav) return;

        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        const currentY = window.scrollY;
        const delta = Math.abs(currentY - lastScrollY);
        const scrollingDown = currentY > lastScrollY;

        if (currentY <= 20) {
            nav.classList.remove('nav--hidden');
            navHidden = false;
        } else if (delta > 6 && scrollingDown) {
            nav.classList.add('nav--hidden');
            navHidden = true;
        } else if (delta > 6 && !scrollingDown) {
            nav.classList.remove('nav--hidden');
            navHidden = false;
        }

        lastScrollY = currentY;
    };

    window.addEventListener('scroll', updateNavState, { passive: true });
    updateNavState();

    // --- Mobile Hero Parallax (Desktop-style effect) ---
    const hero = document.querySelector('.hero');
    if (hero) {
        const mobileQuery = window.matchMedia('(max-width: 968px)');
        const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        let parallaxActive = false;
        let ticking = false;

        const updateHeroParallax = () => {
            ticking = false;
            if (!parallaxActive) return;

            const rect = hero.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) return;

            const offset = -rect.top;
            hero.style.setProperty('--hero-bg-offset', `${offset.toFixed(2)}px`);
        };

        const onParallaxScroll = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(updateHeroParallax);
        };

        const setParallaxState = () => {
            const shouldEnable = mobileQuery.matches && !reduceMotionQuery.matches;
            if (shouldEnable && !parallaxActive) {
                parallaxActive = true;
                updateHeroParallax();
                window.addEventListener('scroll', onParallaxScroll, { passive: true });
                window.addEventListener('resize', onParallaxScroll);
            } else if (!shouldEnable && parallaxActive) {
                parallaxActive = false;
                hero.style.removeProperty('--hero-bg-offset');
                window.removeEventListener('scroll', onParallaxScroll);
                window.removeEventListener('resize', onParallaxScroll);
            }
        };

        const attachMediaListener = (mq, handler) => {
            if (mq.addEventListener) {
                mq.addEventListener('change', handler);
            } else if (mq.addListener) {
                mq.addListener(handler);
            }
        };

        setParallaxState();
        attachMediaListener(mobileQuery, setParallaxState);
        attachMediaListener(reduceMotionQuery, setParallaxState);
    }

    // --- Intersection Observer (Scroll Reveal) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));


    // --- FAQ Accordion ---
    document.querySelectorAll('.accordion-header').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            
            // Close others (Optional, strict accordion style)
            document.querySelectorAll('.accordion-item').forEach(i => {
                if(i !== item) {
                    i.classList.remove('active');
                }
            });

            item.classList.toggle('active');
        });
    });

    // --- Contact Form ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            
            btn.innerText = 'Sending...';
            btn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                btn.innerText = 'Message Sent!';
                btn.style.background = '#4CAF50'; // Green for success
                
                // Reset form
                contactForm.reset();
                
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.background = ''; // Revert to CSS default
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }

    // --- Smooth Scroll Offset ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

});
