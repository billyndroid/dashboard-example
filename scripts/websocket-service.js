/**
 * WebSocket Service
 * Handles real-time data updates via WebSocket connections
 * @version 2.0.0
 */

const WebSocketService = {
    // WebSocket connection
    socket: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 1000,
    reconnectTimer: null,
    
    // Connection state
    isConnected: false,
    isConnecting: false,
    
    // Subscriptions
    subscriptions: new Map(),
    messageHandlers: new Map(),
    
    // Heartbeat
    heartbeatInterval: null,
    lastHeartbeat: null,
    heartbeatTimeout: 30000, // 30 seconds
    
    /**
     * Initialize WebSocket service
     * @param {string} url - WebSocket server URL (optional)
     * @returns {void}
     */
    init(url = null) {
        console.log('Initializing WebSocketService...');
        
        // Get WebSocket URL from config or use provided URL
        const wsUrl = url || this.getWebSocketURL();
        
        if (!wsUrl) {
            console.warn('WebSocket URL not configured. Real-time updates disabled.');
            return;
        }
        
        this.connect(wsUrl);
    },
    
    /**
     * Get WebSocket URL from configuration
     * @returns {string|null} WebSocket URL
     */
    getWebSocketURL() {
        if (AppConfig && AppConfig.websocket && AppConfig.websocket.enabled) {
            return AppConfig.websocket.url;
        }
        
        // Fallback: construct from current location
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}/ws`;
    },
    
    /**
     * Connect to WebSocket server
     * @param {string} url - WebSocket URL
     * @returns {void}
     */
    connect(url) {
        if (this.isConnecting || this.isConnected) {
            console.log('WebSocket already connecting or connected');
            return;
        }
        
        this.isConnecting = true;
        console.log('Connecting to WebSocket:', url);
        
        try {
            this.socket = new WebSocket(url);
            
            // Setup event handlers
            this.socket.onopen = this.handleOpen.bind(this);
            this.socket.onmessage = this.handleMessage.bind(this);
            this.socket.onerror = this.handleError.bind(this);
            this.socket.onclose = this.handleClose.bind(this);
            
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.isConnecting = false;
            this.scheduleReconnect();
        }
    },
    
    /**
     * Handle WebSocket connection open
     * @param {Event} event - Open event
     * @returns {void}
     */
    handleOpen(event) {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Authenticate if needed
        if (AuthService && AuthService.isUserAuthenticated()) {
            this.authenticate();
        }
        
        // Resubscribe to previous subscriptions
        this.resubscribeAll();
        
        // Notify connection status
        this.notifyConnectionStatus('connected');
    },
    
    /**
     * Handle incoming WebSocket messages
     * @param {MessageEvent} event - Message event
     * @returns {void}
     */
    handleMessage(event) {
        try {
            const message = JSON.parse(event.data);
            
            // Update last heartbeat
            if (message.type === 'heartbeat') {
                this.lastHeartbeat = Date.now();
                return;
            }
            
            // Handle authentication response
            if (message.type === 'auth_response') {
                console.log('Authentication:', message.success ? 'successful' : 'failed');
                return;
            }
            
            // Route message to handlers
            this.routeMessage(message);
            
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    },
    
    /**
     * Handle WebSocket errors
     * @param {Event} event - Error event
     * @returns {void}
     */
    handleError(event) {
        console.error('WebSocket error:', event);
        ErrorHandler.handle(new Error('WebSocket connection error'), 'WebSocketService', 'high');
    },
    
    /**
     * Handle WebSocket connection close
     * @param {CloseEvent} event - Close event
     * @returns {void}
     */
    handleClose(event) {
        console.log('WebSocket disconnected', event.code, event.reason);
        this.isConnected = false;
        this.isConnecting = false;
        
        // Stop heartbeat
        this.stopHeartbeat();
        
        // Notify disconnection
        this.notifyConnectionStatus('disconnected');
        
        // Attempt reconnection if not a normal closure
        if (event.code !== 1000) {
            this.scheduleReconnect();
        }
    },
    
    /**
     * Authenticate WebSocket connection
     * @returns {void}
     */
    authenticate() {
        const sessionData = localStorage.getItem('dashboard_session');
        if (!sessionData) return;
        
        try {
            const session = JSON.parse(sessionData);
            this.send({
                type: 'authenticate',
                token: session.token
            });
        } catch (error) {
            console.error('Authentication error:', error);
        }
    },
    
    /**
     * Send message through WebSocket
     * @param {object} message - Message object
     * @returns {boolean} Whether message was sent
     */
    send(message) {
        if (!this.isConnected || !this.socket) {
            console.warn('WebSocket not connected. Message queued.');
            return false;
        }
        
        try {
            this.socket.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('Error sending WebSocket message:', error);
            return false;
        }
    },
    
    /**
     * Subscribe to a channel
     * @param {string} channel - Channel name
     * @param {Function} handler - Message handler function
     * @returns {void}
     */
    subscribe(channel, handler) {
        console.log('Subscribing to channel:', channel);
        
        // Store subscription
        this.subscriptions.set(channel, true);
        this.messageHandlers.set(channel, handler);
        
        // Send subscription message if connected
        if (this.isConnected) {
            this.send({
                type: 'subscribe',
                channel: channel
            });
        }
    },
    
    /**
     * Unsubscribe from a channel
     * @param {string} channel - Channel name
     * @returns {void}
     */
    unsubscribe(channel) {
        console.log('Unsubscribing from channel:', channel);
        
        // Remove subscription
        this.subscriptions.delete(channel);
        this.messageHandlers.delete(channel);
        
        // Send unsubscribe message if connected
        if (this.isConnected) {
            this.send({
                type: 'unsubscribe',
                channel: channel
            });
        }
    },
    
    /**
     * Resubscribe to all channels after reconnection
     * @returns {void}
     */
    resubscribeAll() {
        this.subscriptions.forEach((_, channel) => {
            this.send({
                type: 'subscribe',
                channel: channel
            });
        });
    },
    
    /**
     * Route message to appropriate handler
     * @param {object} message - Message object
     * @returns {void}
     */
    routeMessage(message) {
        const { channel, type, data } = message;
        
        // Get handler for channel
        const handler = this.messageHandlers.get(channel);
        
        if (handler && typeof handler === 'function') {
            handler(data, type);
        } else {
            console.warn('No handler for channel:', channel);
        }
    },
    
    /**
     * Start heartbeat mechanism
     * @returns {void}
     */
    startHeartbeat() {
        this.lastHeartbeat = Date.now();
        
        this.heartbeatInterval = setInterval(() => {
            // Check if heartbeat timed out
            if (Date.now() - this.lastHeartbeat > this.heartbeatTimeout) {
                console.warn('Heartbeat timeout, reconnecting...');
                this.reconnect();
                return;
            }
            
            // Send heartbeat ping
            this.send({ type: 'ping' });
        }, 15000); // Send ping every 15 seconds
    },
    
    /**
     * Stop heartbeat mechanism
     * @returns {void}
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    },
    
    /**
     * Schedule reconnection attempt
     * @returns {void}
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.notifyConnectionStatus('failed');
            return;
        }
        
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
        
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        
        this.reconnectTimer = setTimeout(() => {
            this.reconnect();
        }, delay);
    },
    
    /**
     * Reconnect to WebSocket server
     * @returns {void}
     */
    reconnect() {
        this.disconnect();
        const url = this.getWebSocketURL();
        if (url) {
            this.connect(url);
        }
    },
    
    /**
     * Disconnect from WebSocket server
     * @returns {void}
     */
    disconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        
        this.stopHeartbeat();
        
        if (this.socket) {
            this.socket.close(1000, 'Client disconnect');
            this.socket = null;
        }
        
        this.isConnected = false;
        this.isConnecting = false;
    },
    
    /**
     * Notify connection status change
     * @param {string} status - Connection status
     * @returns {void}
     */
    notifyConnectionStatus(status) {
        // Dispatch custom event
        const event = new CustomEvent('websocket-status', {
            detail: { status: status }
        });
        document.dispatchEvent(event);
        
        // Update UI indicator if exists
        const indicator = document.getElementById('connection-status');
        if (indicator) {
            indicator.className = `connection-status ${status}`;
            indicator.textContent = status === 'connected' ? 'Live' : 
                                   status === 'connecting' ? 'Connecting...' : 'Offline';
        }
    },
    
    /**
     * Get connection status
     * @returns {string} Connection status
     */
    getStatus() {
        if (this.isConnected) return 'connected';
        if (this.isConnecting) return 'connecting';
        return 'disconnected';
    }
};

// Helper functions for common subscriptions

/**
 * Subscribe to market data updates
 * @param {Function} callback - Callback function for market data
 * @returns {void}
 */
WebSocketService.subscribeToMarketData = function(callback) {
    this.subscribe('market-data', (data) => {
        // Update market data in real-time
        if (callback) callback(data);
    });
};

/**
 * Subscribe to order updates
 * @param {Function} callback - Callback function for order updates
 * @returns {void}
 */
WebSocketService.subscribeToOrders = function(callback) {
    this.subscribe('orders', (data) => {
        // Handle order updates
        if (callback) callback(data);
    });
};

/**
 * Subscribe to notifications
 * @param {Function} callback - Callback function for notifications
 * @returns {void}
 */
WebSocketService.subscribeToNotifications = function(callback) {
    this.subscribe('notifications', (data) => {
        // Handle real-time notifications
        if (callback) callback(data);
        
        // Add to NotificationService if available
        if (typeof NotificationService !== 'undefined' && data.notification) {
            NotificationService.create(data.notification);
        }
    });
};

/**
 * Subscribe to price alerts
 * @param {Function} callback - Callback function for price alerts
 * @returns {void}
 */
WebSocketService.subscribeToPriceAlerts = function(callback) {
    this.subscribe('price-alerts', (data) => {
        // Handle price alerts
        if (callback) callback(data);
        
        // Create notification for alert
        if (typeof NotificationService !== 'undefined' && data.alert) {
            NotificationService.create({
                title: 'Price Alert',
                message: data.alert.message,
                category: 'alert',
                priority: 'high'
            });
        }
    });
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketService;
}
