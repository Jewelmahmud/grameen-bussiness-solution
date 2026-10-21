// Asterisk Configuration for Grameen Bazar Support Dashboard

/**
 * Development Configuration
 * Used for local development and testing
 */
const development = {
  asterisk: {
    host: 'localhost',
    port: 8088,
    username: 'admin',
    secret: 'amp111',
    protocol: 'ws', // 'ws' for development, 'wss' for production
    apiUrl: 'http://localhost:8088/ari',
    debug: true,
    applicationName: 'grameen-support-dev',
    defaultCallerId: '01700000000',
    
    // Auto-reconnection settings
    maxReconnectAttempts: 5,
    reconnectInterval: 5000,
    
    // Call settings
    maxCallDuration: 3600, // 1 hour in seconds
    recordingFormat: 'wav',
    autoRecording: false,
    
    // SIP Configuration
    sipTrunk: 'trunk',
    sipEndpointFormat: 'PJSIP/{number}@{trunk}',
    
    // Audio Settings
    holdMusic: 'default',
    ringTones: {
      incoming: 'ring',
      outgoing: 'ringback'
    }
  },
  
  // Database settings for CDR
  database: {
    cdr: {
      host: 'localhost',
      port: 3306,
      username: 'asterisk',
      password: 'asterisk123',
      database: 'asteriskcdrdb',
      table: 'cdr'
    }
  },
  
  // Feature flags
  features: {
    callRecording: true,
    callTransfer: true,
    callHold: true,
    conferenceCall: false,
    voicemail: true,
    ivr: false,
    queueSupport: false
  }
};

/**
 * Production Configuration
 * Used for production deployment
 */
const production = {
  asterisk: {
    host: process.env.ASTERISK_HOST || 'pbx.grameenbazar.com',
    port: parseInt(process.env.ASTERISK_PORT) || 8088,
    username: process.env.ASTERISK_USERNAME || 'grameen-support',
    secret: process.env.ASTERISK_SECRET || 'SecurePassword123!',
    protocol: 'wss', // Secure WebSocket for production
    apiUrl: `https://${process.env.ASTERISK_HOST || 'pbx.grameenbazar.com'}:8089/ari`,
    debug: false,
    applicationName: 'grameen-support-prod',
    defaultCallerId: process.env.DEFAULT_CALLER_ID || '01700000000',
    
    // Auto-reconnection settings
    maxReconnectAttempts: 10,
    reconnectInterval: 3000,
    
    // Call settings
    maxCallDuration: 7200, // 2 hours in seconds
    recordingFormat: 'wav',
    autoRecording: true, // Auto record all calls in production
    
    // SIP Configuration
    sipTrunk: 'grameen-trunk',
    sipEndpointFormat: 'PJSIP/{number}@{trunk}',
    
    // Audio Settings
    holdMusic: 'grameen-hold',
    ringTones: {
      incoming: 'grameen-ring',
      outgoing: 'grameen-ringback'
    }
  },
  
  // Database settings for CDR
  database: {
    cdr: {
      host: process.env.CDR_DB_HOST || 'db.grameenbazar.com',
      port: parseInt(process.env.CDR_DB_PORT) || 3306,
      username: process.env.CDR_DB_USERNAME || 'asterisk',
      password: process.env.CDR_DB_PASSWORD,
      database: process.env.CDR_DB_NAME || 'asteriskcdrdb',
      table: 'cdr'
    }
  },
  
  // Feature flags
  features: {
    callRecording: true,
    callTransfer: true,
    callHold: true,
    conferenceCall: true,
    voicemail: true,
    ivr: true,
    queueSupport: true
  }
};

/**
 * Testing Configuration
 * Used for unit and integration tests
 */
const test = {
  asterisk: {
    host: 'localhost',
    port: 8088,
    username: 'test-user',
    secret: 'test-password',
    protocol: 'ws',
    apiUrl: 'http://localhost:8088/ari',
    debug: true,
    applicationName: 'grameen-support-test',
    defaultCallerId: '01700000000',
    
    // Shorter timeouts for testing
    maxReconnectAttempts: 2,
    reconnectInterval: 1000,
    
    // Call settings
    maxCallDuration: 300, // 5 minutes for tests
    recordingFormat: 'wav',
    autoRecording: false,
    
    // Mock SIP Configuration
    sipTrunk: 'test-trunk',
    sipEndpointFormat: 'PJSIP/{number}@{trunk}',
    
    // Audio Settings
    holdMusic: 'silence',
    ringTones: {
      incoming: 'silence',
      outgoing: 'silence'
    }
  },
  
  // Mock database for testing
  database: {
    cdr: {
      host: 'localhost',
      port: 3306,
      username: 'test',
      password: 'test',
      database: 'test_cdr',
      table: 'cdr'
    }
  },
  
  // All features enabled for testing
  features: {
    callRecording: true,
    callTransfer: true,
    callHold: true,
    conferenceCall: true,
    voicemail: true,
    ivr: true,
    queueSupport: true
  }
};

/**
 * Extension mapping for internal transfers
 */
const extensions = {
  // Support team extensions
  support: {
    manager: '101',
    senior: '102',
    junior: '103',
    technical: '104'
  },
  
  // Department extensions
  departments: {
    sales: '201',
    delivery: '202',
    returns: '203',
    billing: '204',
    management: '301'
  },
  
  // Special numbers
  special: {
    emergency: '911',
    security: '555',
    announcement: '999'
  }
};

/**
 * Call routing rules
 */
const routing = {
  // Incoming call routing based on caller ID patterns
  incoming: [
    {
      pattern: /^017\d{8}$/, // Grameen Phone numbers
      route: 'support.senior',
      priority: 'high'
    },
    {
      pattern: /^018\d{8}$/, // Robi numbers
      route: 'support.junior',
      priority: 'normal'
    },
    {
      pattern: /^019\d{8}$/, // Banglalink numbers
      route: 'support.junior',
      priority: 'normal'
    },
    {
      pattern: /^016\d{8}$/, // Airtel numbers
      route: 'support.junior',
      priority: 'normal'
    },
    {
      pattern: /.*/, // Default catch-all
      route: 'support.junior',
      priority: 'normal'
    }
  ],
  
  // Business hours routing
  businessHours: {
    start: '09:00',
    end: '18:00',
    timezone: 'Asia/Dhaka',
    afterHoursRoute: 'voicemail',
    weekends: 'voicemail'
  }
};

/**
 * Queue Configuration
 */
const queues = {
  'support-queue': {
    name: 'Support Queue',
    strategy: 'rrmemory', // Round Robin with Memory
    timeout: 30,
    retry: 5,
    maxlen: 20,
    announce: 'queue-support-announce',
    members: [
      'PJSIP/support-101',
      'PJSIP/support-102',
      'PJSIP/support-103'
    ]
  },
  
  'urgent-queue': {
    name: 'Urgent Queue',
    strategy: 'linear',
    timeout: 15,
    retry: 3,
    maxlen: 10,
    announce: 'queue-urgent-announce',
    members: [
      'PJSIP/support-101',
      'PJSIP/support-102'
    ]
  }
};

/**
 * IVR (Interactive Voice Response) Configuration
 */
const ivr = {
  mainMenu: {
    message: 'welcome-grameen',
    timeout: 10,
    retries: 3,
    options: {
      '1': { action: 'queue', target: 'support-queue', description: 'General Support' },
      '2': { action: 'queue', target: 'urgent-queue', description: 'Urgent Issues' },
      '3': { action: 'extension', target: '201', description: 'Sales Department' },
      '4': { action: 'extension', target: '202', description: 'Delivery Status' },
      '9': { action: 'extension', target: '301', description: 'Management' },
      '0': { action: 'operator', description: 'Operator' }
    }
  }
};

/**
 * Get configuration based on environment
 */
const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return { ...production, extensions, routing, queues, ivr };
    case 'test':
      return { ...test, extensions, routing, queues, ivr };
    default:
      return { ...development, extensions, routing, queues, ivr };
  }
};

/**
 * Validate configuration
 */
const validateConfig = (config) => {
  const required = ['host', 'port', 'username', 'secret'];
  const asteriskConfig = config.asterisk;
  
  for (const field of required) {
    if (!asteriskConfig[field]) {
      throw new Error(`Missing required Asterisk configuration: ${field}`);
    }
  }
  
  // Validate port range
  if (asteriskConfig.port < 1 || asteriskConfig.port > 65535) {
    throw new Error('Invalid port number');
  }
  
  // Validate protocol
  if (!['ws', 'wss'].includes(asteriskConfig.protocol)) {
    throw new Error('Protocol must be either "ws" or "wss"');
  }
  
  return true;
};

/**
 * Export configuration
 */
const config = getConfig();

// Validate configuration on load
validateConfig(config);

export default config;

// Export individual components for testing
export {
  development,
  production,
  test,
  extensions,
  routing,
  queues,
  ivr,
  getConfig,
  validateConfig
}; 