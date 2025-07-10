document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('subscriptionForm');
    const emailInput = document.getElementById('emailInput');
    const formContainer = document.querySelector('.form-container');
    const subscribeButton = document.querySelector('.subscribe-button');

    // Email validation function
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (!email) {
            showFeedback('Please enter your email address', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showFeedback('Please enter a valid email address', 'error');
            return;
        }
        
        // Send to webhook
        subscribeButton.textContent = 'JOINING...';
        subscribeButton.disabled = true;
        
        try {
            const response = await fetch('https://hook.eu2.make.com/5kcyabr3rktcvo53ix4526serwfftr0c', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    timestamp: new Date().toISOString(),
                    source: 'kitsilano-website'
                })
            });
            
            if (response.ok) {
                showFeedback('Welcome to the neighbourhood! Check your email soon.', 'success');
                emailInput.value = '';
            } else {
                throw new Error('Subscription failed');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            showFeedback('Oops! Something went wrong. Please try again.', 'error');
        } finally {
            subscribeButton.textContent = "I'M IN →";
            subscribeButton.disabled = false;
        }
    });

    // Show feedback function
    function showFeedback(message, type) {
        // Remove existing feedback classes
        formContainer.classList.remove('form-success', 'form-error');
        
        // Add appropriate feedback class
        if (type === 'success') {
            formContainer.classList.add('form-success');
        } else if (type === 'error') {
            formContainer.classList.add('form-error');
        }
        
        // Create and show message
        const existingMessage = document.querySelector('.feedback-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = 'feedback-message';
        messageElement.style.cssText = `
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 25px;
            color: white;
            font-size: 0.9rem;
            white-space: nowrap;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        messageElement.textContent = message;
        
        form.style.position = 'relative';
        form.appendChild(messageElement);
        
        // Fade in message
        setTimeout(() => {
            messageElement.style.opacity = '1';
        }, 100);
        
        // Remove feedback after 3 seconds
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
                formContainer.classList.remove('form-success', 'form-error');
            }, 300);
        }, 3000);
    }

    // Add smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Navigation clicked:', this.textContent);
        });
    });

    // Add hover effects for social icons
    document.querySelectorAll('.social-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Social icon clicked:', this.getAttribute('aria-label'));
        });
    });

    // Add entrance animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    // Observe main content elements for animation
    document.querySelectorAll('.subscriber-info, .main-heading, .main-description, .subscription-form').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
});
