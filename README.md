# Serenity Hypnotherapy Website

A professional, elegant website for hypnotherapy services featuring a calming design, animated preloader, and comprehensive service information.

## Features

- **Elegant Design**: Professional color palette with calming blues, greens, and warm neutrals
- **Animated Preloader**: Smooth loading experience with your eye logo animation
- **Responsive Layout**: Fully responsive design that works on all devices
- **Smooth Animations**: Subtle transitions and scroll-based animations
- **Contact Form**: Professional contact form with validation
- **SEO Optimized**: Clean HTML structure with proper meta tags
- **Performance Optimized**: Fast loading with optimized CSS and JavaScript

## Technologies Used

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript
- Google Fonts (Playfair Display & Source Sans Pro)
- Font Awesome icons

## File Structure

```
hypnotherapy/
├── index.html          # Main website file
├── styles.css          # All styling and responsive design
├── script.js           # Interactive functionality
├── robots.txt          # SEO configuration
├── sitemap.xml         # Search engine sitemap
├── .htaccess           # Server configuration
├── media/              # Assets directory
│   └── Logo_Eye_Slow_Blink_Animation-ezgif.com-optiwebp.webp
└── README.md           # This file
```

## Setup Instructions

1. **Upload Files**: Upload all files to your web server maintaining the directory structure
2. **Test Locally**: Open `index.html` in a browser to test locally
3. **Customize Content**: Update the contact information, services, and testimonials to match your practice
4. **Add Images**: Replace placeholder images with professional photos of your practice
5. **Configure Contact Form**: Set up server-side form handling for the contact form

## Customization Guide

### Contact Information
Update the contact details in the contact section:
- Phone number
- Email address  
- Physical address
- Business hours

### Services
Modify the services section to reflect your specific offerings and pricing.

### Testimonials
Replace the sample testimonials with real client feedback (with permission).

### Colors & Branding
The color scheme can be adjusted in the CSS variables at the top of `styles.css`:
```css
:root {
    --primary-color: #2c5282;    /* Main brand color */
    --secondary-color: #68d391;  /* Accent color */
    /* ... other variables */
}
```

### Images
- Replace placeholder images with professional photos
- Optimize images for web (WebP format recommended)
- Ensure images are high-quality and properly sized

## Performance Tips

- Images are optimized for web
- CSS and JavaScript are minified in production
- Uses modern web standards for best performance
- Implements lazy loading for images (if added)

## Browser Support

- Chrome (latest)
- Firefox (latest) 
- Safari (latest)
- Edge (latest)
- IE11+ (with some graceful degradation)

## Contact Form Setup

The contact form currently uses JavaScript for client-side handling. For production use, you'll need:

1. **Server-side Processing**: PHP, Node.js, or other backend to handle form submissions
2. **Email Integration**: SMTP service or email API (SendGrid, Mailgun, etc.)
3. **Spam Protection**: reCAPTCHA or similar anti-spam measures
4. **Database Storage**: Optional - store form submissions in a database

## SEO Optimization

The website includes:
- Semantic HTML structure
- Meta tags for description and keywords
- Open Graph tags for social media
- Proper heading hierarchy
- Alt tags for images
- Clean URL structure

## Accessibility Features

- Keyboard navigation support
- Screen reader friendly
- High contrast colors
- Focus indicators
- Semantic HTML elements

## Maintenance

- Regularly update testimonials
- Keep service information current
- Monitor contact form submissions
- Update business hours and contact info as needed
- Backup website files regularly

## Support

For technical support or customization needs, please contact your web developer.

---

© 2024 Serenity Hypnotherapy. All rights reserved.