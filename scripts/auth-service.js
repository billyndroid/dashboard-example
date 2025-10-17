/**
 * Authentication Service
 * Handles user authentication, session management, and user profiles
 * @version 2.0.0
 */

const AuthService = {
    // Current user state
    currentUser: null,
    isAuthenticated: false,
    sessionTimeout: null,
    sessionDuration: 3600000, // 1 hour in milliseconds

    /**
     * Initialize authentication service
     * Checks for existing session and validates it
     * @returns {void}
     */
    init() {
        console.log('Initializing AuthService...');
        this.checkExistingSession();
        this.setupSessionMonitoring();
    },

    /**
     * Check for existing session in localStorage
     * Validates session and restores user if valid
     * @returns {boolean} Whether session was restored
     */
    checkExistingSession() {
        try {
            const sessionData = localStorage.getItem('dashboard_session');
            if (!sessionData) return false;

            const session = JSON.parse(sessionData);
            const now = Date.now();

            // Check if session is still valid
            if (session.expiresAt && session.expiresAt > now) {
                this.currentUser = session.user;
                this.isAuthenticated = true;
                this.startSessionTimeout(session.expiresAt - now);
                this.updateUI();
                console.log('Session restored for user:', this.currentUser.email);
                return true;
            } else {
                // Session expired
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Error checking session:', error);
            return false;
        }
    },

    /**
     * Login user with credentials
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {boolean} rememberMe - Whether to extend session
     * @returns {Promise<object>} Login result with user data or error
     */
    async login(email, password, rememberMe = false) {
        try {
            // Validate inputs
            if (!SecurityUtils.validateEmail(email)) {
                return { success: false, error: 'Invalid email format' };
            }

            if (!password || password.length < 6) {
                return { success: false, error: 'Password must be at least 6 characters' };
            }

            // Check if we should use real API or mock authentication
            const useMockAuth = window.AppConfig?.useMockData ?? true;
            let result;
            
            if (!useMockAuth && window.AppConfig?.api?.endpoints?.auth?.login) {
                // Real API authentication
                result = await this.apiLogin(email, password);
            } else {
                // Mock authentication
                result = await this.mockLogin(email, password);
            }

            if (result.success) {
                const sessionDuration = rememberMe ? 2592000000 : this.sessionDuration; // 30 days vs 1 hour
                this.createSession(result.user, sessionDuration);
                this.updateUI();
                
                // Log authentication event
                this.logAuthEvent('login', { email: result.user.email });
                
                return { success: true, user: result.user };
            } else {
                // Log failed attempt
                this.logAuthEvent('login_failed', { email });
                return { success: false, error: result.error };
            }
        } catch (error) {
            ErrorHandler.handle(error, 'AuthService.login', 'high');
            return { success: false, error: 'Login failed. Please try again.' };
        }
    },

    /**
     * Real API login function
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<object>} Login result
     */
    async apiLogin(email, password) {
        try {
            const apiUrl = window.AppConfig.getApiUrl(window.AppConfig.api.endpoints.auth.login);
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password }),
                signal: AbortSignal.timeout(window.AppConfig.api.timeout)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    return { success: false, error: 'Invalid email or password' };
                }
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            
            // Expected response format:
            // { success: true, user: {...}, token: '...' }
            if (data.success && data.user) {
                // Store auth token if provided
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                }
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error || 'Login failed' };
            }
            
        } catch (error) {
            console.error('[AuthService] API login error:', error);
            // Fallback to mock login on API error
            console.log('[AuthService] Falling back to mock authentication');
            return await this.mockLogin(email, password);
        }
    },

    /**
     * Mock login function for demonstration
     * Used when useMockData is true or API is unavailable
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<object>} Mock login result
     */
    async mockLogin(email, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock users database
        const mockUsers = [
            {
                id: '1',
                email: 'demo@dashboard.com',
                password: 'demo123', // In production: use hashed passwords!
                name: 'Demo User',
                role: 'trader',
                avatar: 'assets/profile-pic-1.png',
                preferences: {
                    theme: 'light',
                    notifications: true,
                    language: 'en'
                }
            },
            {
                id: '2',
                email: 'admin@dashboard.com',
                password: 'admin123',
                name: 'Admin User',
                role: 'admin',
                avatar: 'assets/profile-pic-2.png',
                preferences: {
                    theme: 'dark',
                    notifications: true,
                    language: 'en'
                }
            }
        ];

        // Find user
        const user = mockUsers.find(u => u.email === email && u.password === password);

        if (user) {
            // Don't return password to client
            const { password: _, ...userWithoutPassword } = user;
            return { success: true, user: userWithoutPassword };
        } else {
            return { success: false, error: 'Invalid email or password' };
        }
    },

    /**
     * Create and store user session
     * @param {object} user - User object
     * @param {number} duration - Session duration in milliseconds
     * @returns {void}
     */
    createSession(user, duration) {
        this.currentUser = user;
        this.isAuthenticated = true;

        const session = {
            user: user,
            createdAt: Date.now(),
            expiresAt: Date.now() + duration,
            token: this.generateSessionToken()
        };

        // Store session
        localStorage.setItem('dashboard_session', JSON.stringify(session));

        // Apply user preferences
        if (user.preferences) {
            this.applyUserPreferences(user.preferences);
        }

        // Start session timeout
        this.startSessionTimeout(duration);
    },

    /**
     * Generate a session token (mock implementation)
     * In production, this should be a JWT from the server
     * @returns {string} Session token
     */
    generateSessionToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },

    /**
     * Apply user preferences to the dashboard
     * @param {object} preferences - User preferences
     * @returns {void}
     */
    applyUserPreferences(preferences) {
        // Apply theme
        if (preferences.theme === 'dark') {
            document.body.classList.add('dark-theme-variables');
            localStorage.setItem('dashboard-theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme-variables');
            localStorage.setItem('dashboard-theme', 'light');
        }

        // Update config
        if (AppConfig && AppConfig.ui) {
            AppConfig.ui.theme = preferences.theme;
        }
    },

    /**
     * Start session timeout countdown
     * @param {number} duration - Duration until timeout in milliseconds
     * @returns {void}
     */
    startSessionTimeout(duration) {
        // Clear existing timeout
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
        }

        // Set new timeout
        this.sessionTimeout = setTimeout(() => {
            this.handleSessionExpiry();
        }, duration);
    },

    /**
     * Handle session expiry
     * @returns {void}
     */
    handleSessionExpiry() {
        console.log('Session expired');
        this.logout();
        this.showSessionExpiredMessage();
    },

    /**
     * Show session expired message
     * @returns {void}
     */
    showSessionExpiredMessage() {
        if (typeof NotificationService !== 'undefined') {
            NotificationService.create({
                title: 'Session Expired',
                message: 'Your session has expired. Please log in again.',
                category: 'system',
                priority: 'high'
            });
        } else {
            alert('Your session has expired. Please log in again.');
        }
    },

    /**
     * Logout current user
     * @returns {void}
     */
    logout() {
        // Clear session data
        localStorage.removeItem('dashboard_session');
        
        // Clear session timeout
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }

        // Log logout event
        if (this.currentUser) {
            this.logAuthEvent('logout', { email: this.currentUser.email });
        }

        // Reset state
        this.currentUser = null;
        this.isAuthenticated = false;

        // Update UI
        this.updateUI();

        // Redirect to login page
        this.redirectToLogin();
    },

    /**
     * Redirect to login page
     * @returns {void}
     */
    redirectToLogin() {
        // Check if we're not already on login page
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    },

    /**
     * Update UI based on authentication state
     * @returns {void}
     */
    updateUI() {
        if (this.isAuthenticated && this.currentUser) {
            // Update user info in UI
            this.updateUserInfo();
            
            // Show authenticated content
            this.showAuthenticatedContent();
        } else {
            // Hide authenticated content
            this.hideAuthenticatedContent();
        }
    },

    /**
     * Update user information in UI
     * @returns {void}
     */
    updateUserInfo() {
        const userNameElements = document.querySelectorAll('.user-name');
        const userEmailElements = document.querySelectorAll('.user-email');
        const userAvatarElements = document.querySelectorAll('.user-avatar');

        userNameElements.forEach(el => {
            el.textContent = this.currentUser.name;
        });

        userEmailElements.forEach(el => {
            el.textContent = this.currentUser.email;
        });

        userAvatarElements.forEach(el => {
            el.src = this.currentUser.avatar;
        });
    },

    /**
     * Show content for authenticated users
     * @returns {void}
     */
    showAuthenticatedContent() {
        const authElements = document.querySelectorAll('[data-auth="required"]');
        authElements.forEach(el => {
            el.style.display = '';
        });

        const noAuthElements = document.querySelectorAll('[data-auth="not-required"]');
        noAuthElements.forEach(el => {
            el.style.display = 'none';
        });
    },

    /**
     * Hide content that requires authentication
     * @returns {void}
     */
    hideAuthenticatedContent() {
        const authElements = document.querySelectorAll('[data-auth="required"]');
        authElements.forEach(el => {
            el.style.display = 'none';
        });

        const noAuthElements = document.querySelectorAll('[data-auth="not-required"]');
        noAuthElements.forEach(el => {
            el.style.display = '';
        });
    },

    /**
     * Get current user
     * @returns {object|null} Current user object or null
     */
    getCurrentUser() {
        return this.currentUser;
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isUserAuthenticated() {
        return this.isAuthenticated;
    },

    /**
     * Update user profile
     * @param {object} updates - Profile updates
     * @returns {Promise<object>} Update result
     */
    async updateProfile(updates) {
        try {
            if (!this.isAuthenticated) {
                return { success: false, error: 'Not authenticated' };
            }

            // Validate updates
            if (updates.email && !SecurityUtils.validateEmail(updates.email)) {
                return { success: false, error: 'Invalid email format' };
            }

            // In production, call API to update profile
            // For now, simulate with local update
            this.currentUser = { ...this.currentUser, ...updates };

            // Update session
            const sessionData = JSON.parse(localStorage.getItem('dashboard_session'));
            sessionData.user = this.currentUser;
            localStorage.setItem('dashboard_session', JSON.stringify(sessionData));

            // Update UI
            this.updateUI();

            // Log event
            this.logAuthEvent('profile_updated', { updates: Object.keys(updates) });

            return { success: true, user: this.currentUser };
        } catch (error) {
            ErrorHandler.handle(error, 'AuthService.updateProfile', 'medium');
            return { success: false, error: 'Failed to update profile' };
        }
    },

    /**
     * Change user password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<object>} Password change result
     */
    async changePassword(currentPassword, newPassword) {
        try {
            if (!this.isAuthenticated) {
                return { success: false, error: 'Not authenticated' };
            }

            // Validate new password
            if (!newPassword || newPassword.length < 6) {
                return { success: false, error: 'Password must be at least 6 characters' };
            }

            if (newPassword === currentPassword) {
                return { success: false, error: 'New password must be different' };
            }

            // In production, call API to change password
            // For now, simulate success
            await new Promise(resolve => setTimeout(resolve, 500));

            // Log event
            this.logAuthEvent('password_changed', { email: this.currentUser.email });

            return { success: true };
        } catch (error) {
            ErrorHandler.handle(error, 'AuthService.changePassword', 'high');
            return { success: false, error: 'Failed to change password' };
        }
    },

    /**
     * Setup session activity monitoring
     * Extends session on user activity
     * @returns {void}
     */
    setupSessionMonitoring() {
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        let lastActivity = Date.now();

        const handleActivity = PerformanceUtils.throttle(() => {
            if (this.isAuthenticated) {
                const now = Date.now();
                const timeSinceLastActivity = now - lastActivity;

                // If more than 5 minutes since last activity, extend session
                if (timeSinceLastActivity > 300000) {
                    this.extendSession();
                }

                lastActivity = now;
            }
        }, 60000); // Check once per minute

        activityEvents.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });
    },

    /**
     * Extend current session
     * @returns {void}
     */
    extendSession() {
        try {
            const sessionData = JSON.parse(localStorage.getItem('dashboard_session'));
            if (!sessionData) return;

            const newExpiresAt = Date.now() + this.sessionDuration;
            sessionData.expiresAt = newExpiresAt;
            localStorage.setItem('dashboard_session', JSON.stringify(sessionData));

            // Restart timeout
            this.startSessionTimeout(this.sessionDuration);

            console.log('Session extended');
        } catch (error) {
            console.error('Error extending session:', error);
        }
    },

    /**
     * Log authentication events
     * @param {string} event - Event name
     * @param {object} data - Event data
     * @returns {void}
     */
    logAuthEvent(event, data) {
        const logEntry = {
            event: event,
            timestamp: new Date().toISOString(),
            data: data
        };

        console.log('Auth Event:', logEntry);

        // In production, send to analytics/monitoring service
        if (AppConfig && AppConfig.monitoring && AppConfig.monitoring.enabled) {
            // Send to monitoring service
            // Example: MonitoringService.trackEvent('auth', logEntry);
        }
    },

    /**
     * Get user permissions
     * @returns {array} Array of permission strings
     */
    getUserPermissions() {
        if (!this.currentUser) return [];

        // Define role-based permissions
        const rolePermissions = {
            admin: ['view', 'create', 'edit', 'delete', 'manage_users', 'view_reports'],
            trader: ['view', 'create', 'edit', 'view_reports'],
            viewer: ['view']
        };

        return rolePermissions[this.currentUser.role] || [];
    },

    /**
     * Check if user has permission
     * @param {string} permission - Permission to check
     * @returns {boolean} Whether user has permission
     */
    hasPermission(permission) {
        const permissions = this.getUserPermissions();
        return permissions.includes(permission);
    },

    /**
     * Require authentication for page
     * Redirects to login if not authenticated
     * @returns {void}
     */
    requireAuth() {
        if (!this.isAuthenticated) {
            // Store intended destination
            sessionStorage.setItem('redirect_after_login', window.location.pathname);
            this.redirectToLogin();
        }
    },

    /**
     * Handle post-login redirect
     * @returns {void}
     */
    handlePostLoginRedirect() {
        const redirect = sessionStorage.getItem('redirect_after_login');
        if (redirect) {
            sessionStorage.removeItem('redirect_after_login');
            window.location.href = redirect;
        } else {
            window.location.href = 'index.html';
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AuthService.init());
} else {
    AuthService.init();
}
