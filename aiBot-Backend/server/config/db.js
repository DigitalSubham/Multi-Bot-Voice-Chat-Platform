const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
    connectionString: env.databaseUrl,
    // Production-ready pool settings
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Log pool errors so they don't crash the process
pool.on('error', (err) => {
    console.error('⚠️  Unexpected PostgreSQL pool error:', err.message);
});

/**
 * Run a parameterized SQL query.
 * @param {string} text    – SQL query with $1, $2… placeholders
 * @param {any[]}  params  – values bound to the placeholders
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

/**
 * Acquire a dedicated client from the pool (for transactions).
 * Caller MUST call client.release() when done.
 */
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };
