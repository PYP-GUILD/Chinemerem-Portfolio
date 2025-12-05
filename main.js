// Hamburger menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.navbar ul');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when a link is clicked
    const navLinks = document.querySelectorAll('.navbar ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (hamburger && hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
});

// Form validation and submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Basic form validation
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (!name || !email || !message) {
                alert('Please fill in all fields');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }

            // If validation passes, submit the form
            this.submit();
        });
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add active class to current navigation item
function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Initialize navigation
setActiveNav();

// Lightbox functionality for project images
(function() {
    const triggers = document.querySelectorAll('.lightbox-trigger');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
    const closeBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;

    if (!lightbox || !lightboxImg) return;

    function open(src, alt) {
        lightboxImg.src = src;
        lightboxImg.alt = alt || 'Expanded image';
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        // focus close button for accessibility
        if (closeBtn) closeBtn.focus();
    }

    function close() {
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImg.src = '';
        document.body.style.overflow = '';
    }

    triggers.forEach(tr => {
        tr.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href') || '';
            const img = this.querySelector('img');
            const alt = img ? img.alt : '';
            if (href) open(href, alt);
        });
    });

    // Close interactions
    if (closeBtn) closeBtn.addEventListener('click', close);
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox || e.target === lightboxImg) {
            // click on backdrop or image closes lightbox
            close();
        }
    });

    // ESC to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') {
            close();
        }
    });
})();