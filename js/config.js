/**
 * Configuration for Matrix Terminal Chatbot
 * Webhook and environment settings
 */

const MatrixConfig = {
    // n8n Webhook Configuration
    webhook: {
        url: (typeof process !== 'undefined' && process.env?.VITE_WEBHOOK_URL) ||
             (typeof window !== 'undefined' && window.ENV?.VITE_WEBHOOK_URL),
        timeout: 30000, // 30 seconds
        retryAttempts: 3,
        retryDelay: 2000, // 2 seconds
        usePost: false // Set to true to use POST instead of GET
    },

    // Environment Detection
    environment: {
        get isLocal() {
            return window.location.hostname === 'localhost' ||
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';
        },
        get isDevelopment() {
            return this.isLocal ||
                   window.location.hostname.includes('dev') ||
                   window.location.hostname.includes('preview');
        },
        get isProduction() {
            return !this.isLocal && !this.isDevelopment;
        },
        get isVercel() {
            return window.location.hostname.includes('vercel.app');
        }
    },

    // Feature Flags
    features: {
        webhookEnabled: true,
        fallbackToMock: true,
        soundEffects: true,
        connectionStatus: true,
        debugging: false
    },

    // UI Configuration
    ui: {
        maxMessages: 100, // Maximum chat history
        typingSpeed: 50, // Typewriter effect speed (ms)
        connectionTimeout: 5000, // Connection status timeout
        maxRetries: 3
    },

    // Debug mode based on environment
    get debug() {
        return this.environment.isDevelopment || this.features.debugging;
    },

    // Log function for debugging
    log(message, type = 'info') {
        if (this.debug) {
            const timestamp = new Date().toLocaleTimeString();
            const prefix = `[${timestamp}] Matrix Terminal:`;

            switch (type) {
                case 'error':
                    console.error(prefix, message);
                    break;
                case 'warn':
                    console.warn(prefix, message);
                    break;
                case 'info':
                default:
                    console.log(prefix, message);
                    break;
            }
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MatrixConfig;
}
