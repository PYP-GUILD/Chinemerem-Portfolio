/**
 * Integration Guide: Connect Frontend to Backend
 * 
 * Add this script to your HTML pages to integrate with the backend
 */

// ============ CONTACT FORM INTEGRATION ============

// Add this to contact.html before </body>

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Show loading state
            const submitBtn = contactForm.querySelector('.submit-btn') || contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;
            }

            try {
                if (!portfolioAPI.enabled) {
                    // Save submission locally when offline
                    const key = 'chinemerem_offline_contacts';
                    const stored = JSON.parse(localStorage.getItem(key) || '[]');
                    stored.push({ name, email, subject, message, timestamp: new Date().toISOString() });
                    localStorage.setItem(key, JSON.stringify(stored));
                    alert('✓ No backend detected — your message was saved locally.');
                    contactForm.reset();
                } else {
                    // Call API client
                    await portfolioAPI.submitContact({ name, email, subject, message });
                    alert('✓ Message sent successfully! We will get back to you soon.');
                    contactForm.reset();
                }

            } catch (error) {
                alert('✗ Error: ' + (error.message || 'Unknown error'));
                console.error('Contact form error:', error);
            } finally {
                if (submitBtn) {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }
});

// ============ PORTFOLIO DATA DISPLAY ============

// Fetch and display portfolio data dynamically
async function loadPortfolioData() {
    try {
        if (!portfolioAPI.enabled) {
            console.warn('Skipping portfolio data load — backend offline');
            return;
        }
        const data = await portfolioAPI.getPortfolioData();
        console.log('Portfolio data loaded:', data);
        if (data && data.data) {
            const portfolio = data.data;
            // Update DOM elements with portfolio data if desired
        }
    } catch (error) {
        console.error('Failed to load portfolio data:', error);
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', loadPortfolioData);

// ============ ANALYTICS TRACKING ============

// Track specific user interactions

// Track project clicks
document.addEventListener('click', function(e) {
    if (e.target.closest('.project-card')) {
        const projectTitle = e.target.closest('.project-card').querySelector('h3') ? textContent : ' ';
        if (portfolioAPI.enabled) portfolioAPI.trackAction(window.location.pathname, `project_click: ${projectTitle}`).catch(() => {});
    }
});

// Track skill section views
function trackSkillsView() {
    const skillsSection = document.querySelector('.skills-column');
    if (skillsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (portfolioAPI.enabled) portfolioAPI.trackAction(window.location.pathname, 'skills_section_viewed').catch(() => {});
                    observer.unobserve(entry.target);
                }
            });
        });
        observer.observe(skillsSection);
    }
}

document.addEventListener('DOMContentLoaded', trackSkillsView);

// ============ HEALTH CHECK ============

// Verify backend is running
async function checkBackendHealth() {
    try {
        const health = await portfolioAPI.healthCheck();
        console.log('✓ Backend is running:', health.message);
        return true;
    } catch (error) {
        console.warn('⚠ Backend is offline. Using fallback mode.');
        return false;
    }
}

// Check on page load
document.addEventListener('DOMContentLoaded', checkBackendHealth);

// ============ HOW TO INTEGRATE ============

/**
 * STEP 1: Update your HTML files
 * 
 * At the end of each HTML file (before </body>), add:
 * 
 * <script src="assets/js/api-client.js"></script>
 * <script src="assets/js/backend-integration.js"></script>
 * 
 * 
 * STEP 2: Update contact form HTML
 * 
 * Change this:
 * <form id="contact-form" action="mailto:princetec1990@gmail.com" method="POST">
 * 
 * To this:
 * <form id="contact-form">
 * 
 * Remove the action and method attributes - the JavaScript will handle it.
 * 
 * 
 * STEP 3: Start the backend server
 * 
 * In terminal:
 * npm install (if not done)
 * npm start
 * 
 * 
 * STEP 4: Test
 * 
 * Open your portfolio in browser and try:
 * - Submitting the contact form
 * - Viewing the console (F12) to see analytics
 * 
 * 
 * STEP 5: Deploy
 * 
 * See BACKEND_README.md for deployment options
 */