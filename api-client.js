/**
 * PortfolioClient (offline-friendly)
 * Provides a safe no-op fallback when backend is removed/offline.
 * Contact submissions are saved to localStorage when offline.
 */

class PortfolioClient {
    constructor(baseURL = 'http://localhost:5000') {
        this.baseURL = baseURL;
        this.apiBase = `${baseURL}/api`;
        this.enabled = false; // set after init()
    }

    async init(timeoutMs = 3000) {
        // Try a quick health check to determine if backend exists
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeoutMs);
            const res = await fetch(`${this.apiBase}/health`, { signal: controller.signal });
            clearTimeout(id);
            if (res.ok) {
                this.enabled = true;
                console.log('portfolioAPI: backend is available');
                return true;
            }
        } catch (err) {
            // Backend unreachable or CORS blocked
        }
        this.enabled = false;
        console.warn('portfolioAPI: backend unavailable — running in offline mode');
        return false;
    }

    // Internal request wrapper (throws if offline)
    async request(endpoint, options = {}) {
        if (!this.enabled) {
            throw new Error('Backend disabled (offline mode)');
        }

        const url = `${this.apiBase}${endpoint}`;
        const cfg = Object.assign({ headers: { 'Content-Type': 'application/json' } }, options);
        const res = await fetch(url, cfg);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `API Error ${res.status}`);
        return data;
    }

    // Health check
    async healthCheck() {
        if (!this.enabled) return { status: 'offline' };
        return this.request('/health');
    }

    // Submit contact form. When offline, save to localStorage and resolve with a local response.
    async submitContact(contactData) {
        const { name, email, subject, message } = contactData || {};
        if (!name || !email || !subject || !message) {
            throw new Error('All fields are required');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Invalid email format');
        }

        if (!this.enabled) {
            // Save offline submission
            try {
                const key = 'chinemerem_offline_contacts';
                const stored = JSON.parse(localStorage.getItem(key) || '[]');
                stored.push({ name, email, subject, message, timestamp: new Date().toISOString() });
                localStorage.setItem(key, JSON.stringify(stored));
                return { status: 'saved_offline', message: 'Saved locally (offline mode)' };
            } catch (err) {
                throw new Error('Failed to save offline submission');
            }
        }

        return this.request('/contact', {
            method: 'POST',
            body: JSON.stringify({ name, email, subject, message })
        });
    }

    async getPortfolioData() {
        if (!this.enabled) return { status: 'offline', data: null };
        return this.request('/portfolio');
    }

    async trackEvent(page, action, duration = 0) {
        if (!this.enabled) return { status: 'offline' };
        return this.request('/analytics', {
            method: 'POST',
            body: JSON.stringify({ page, action, duration })
        });
    }

    trackPageView(page) {
        return this.trackEvent(page, 'page_view');
    }

    trackAction(page, action) {
        return this.trackEvent(page, action);
    }

    trackTimeSpent(page, duration) {
        return this.trackEvent(page, 'time_spent', duration);
    }
}

// Create global instance
const portfolioAPI = new PortfolioClient();

// Initialize on DOMContentLoaded and then perform tracking only if enabled
document.addEventListener('DOMContentLoaded', async() => {
    await portfolioAPI.init();
    const currentPage = window.location.pathname;
    if (portfolioAPI.enabled) {
        portfolioAPI.trackPageView(currentPage).catch(() => {});
    }
});

// Track time spent only if enabled
let pageStartTime = Date.now();
window.addEventListener('beforeunload', () => {
    const duration = Math.floor((Date.now() - pageStartTime) / 1000);
    const currentPage = window.location.pathname;
    if (portfolioAPI.enabled) {
        // Use navigator.sendBeacon if available for reliability
        try {
            const payload = JSON.stringify({ page: currentPage, action: 'time_spent', duration });
            if (navigator.sendBeacon && portfolioAPI.enabled) {
                navigator.sendBeacon(`${portfolioAPI.apiBase}/analytics`, payload);
            } else {
                portfolioAPI.trackTimeSpent(currentPage, duration).catch(() => {});
            }
        } catch (e) {
            // ignore
        }
    }
});