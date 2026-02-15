const fs = require('fs');
const path = require('path');
const { pool } = require('./config/db');

const initializeDatabase = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('🔄 Connecting to PostgreSQL...');
        const client = await pool.connect();

        console.log('📄 Executing schema.sql script...');
        await client.query(schema);

        console.log('✅ Database initialized successfully!');
        client.release();

        // Check if tables exist
        const result = await pool.query(
            `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_name IN ('users', 'bots', 'chat_messages')`
        );

        if (result.rows.length === 3) {
            console.log('✅ Found all tables: users, bots, chat_messages');
        } else {
            console.warn('⚠️  Could not confirm all tables exist. Check schema.sql manually.');
        }
    } catch (err) {
        console.error('❌ Database initialization failed:', err);
        process.exit(1);
    } finally {
        try {
            // Wait briefly for logs
            await new Promise(r => setTimeout(r, 500));
            await pool.end();
        } catch (e) {
            // Ignore pool close errors
        }
    }
};

initializeDatabase();
