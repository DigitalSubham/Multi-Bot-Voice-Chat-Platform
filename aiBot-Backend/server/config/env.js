const dotenv = require('dotenv');
const path = require('path');

// Load .env from project root
const result = dotenv.config({ path: path.resolve(__dirname, '../../.env') });
if (result.error) {
  console.warn('⚠️  Could not load .env file:', result.error.message);
} else {
  console.log('✅ Loaded .env file');
}

const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GEMINI_API_KEY',
];

// Validate required environment variables on startup
const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌  Missing required environment variables:\n   ${missing.join(', ')}`);
  process.exit(1);
}

const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  // PostgreSQL
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // Gemini
  geminiApiKey: process.env.GEMINI_API_KEY,

  // Qdrant
  qdrantUrl: process.env.QDRANT_URL || 'http://localhost:6333',
  qdrantApiKey: process.env.QDRANT_API_KEY || undefined,
};

module.exports = env;
