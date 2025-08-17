// Example configuration file for Sei Blockchain Analytics
// Copy this file to config.js and update the values

module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*'
  },

  // Sei Network Configuration
  sei: {
    rpcUrl: process.env.SEI_RPC_URL || 'https://sei-rpc-endpoint',
    wsUrl: process.env.SEI_WS_URL || 'wss://sei-ws-endpoint',
    chainId: process.env.SEI_CHAIN_ID || 'sei-devnet-1',
    timeout: 30000
  },

  // Database Configuration (for future use)
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sei-analytics',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    bcryptRounds: 12
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    maxSize: '20m',
    maxFiles: '14d'
  },

  // Cache Configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300000, // 5 minutes
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  // External API Keys (for future integrations)
  apis: {
    coingecko: process.env.COINGECKO_API_KEY || 'your-coingecko-api-key',
    etherscan: process.env.ETHERSCAN_API_KEY || 'your-etherscan-api-key'
  },

  // Monitoring Configuration
  monitoring: {
    enabled: process.env.ENABLE_METRICS === 'true',
    port: parseInt(process.env.METRICS_PORT) || 9090
  },

  // WebSocket Configuration
  websocket: {
    heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL) || 30000,
    maxReconnectAttempts: parseInt(process.env.WS_MAX_RECONNECT_ATTEMPTS) || 5
  },

  // Feature Flags
  features: {
    realTimeTracking: true,
    advancedAnalytics: true,
    exportFunctionality: true,
    notifications: true
  }
};
