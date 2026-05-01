const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is required for PostgreSQL connection');
}
if (/infinityfree\.com|sql311\.|sql312\./i.test(connectionString)) {
    throw new Error('Legacy InfinityFree DATABASE_URL is not supported. Set DATABASE_URL to Render PostgreSQL only.');
}
if (process.env.DB_HOST || process.env.DB_USER || process.env.DB_PASSWORD || process.env.DB_NAME) {
    console.warn('⚠️ Deprecated MySQL env vars detected. Remove DB_HOST, DB_USER, DB_PASSWORD, DB_NAME and use DATABASE_URL only.');
}
if (process.env.PG_CONNECTION_STRING) {
    console.warn('⚠️ PG_CONNECTION_STRING is ignored. Use DATABASE_URL only.');
}
console.log('🔐 DATABASE_URL loaded:', connectionString.replace(/:[^:@]+@/, ':******@'));

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    max: 10
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL idle client error:', err);
});

function convertPlaceholders(sql) {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`);
}

async function testDatabaseConnection() {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        console.log('✅ PostgreSQL database connected successfully');
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        return false;
    }
}

async function query(sql, params = []) {
    try {
        const convertedSql = convertPlaceholders(sql);
        const result = await pool.query(convertedSql, params);

        if (result.command === 'SELECT') {
            return [result.rows, result];
        }

        const meta = {
            rowCount: result.rowCount,
            affectedRows: result.rowCount,
            insertId: result.rows && result.rows[0] ? result.rows[0].id : null
        };

        return [meta, result];
    } catch (err) {
        console.error('Database query error:', err);
        throw err;
    }
}

// Test on startup (async, don't block server startup)
testDatabaseConnection().catch(err => {
    console.error('⚠️  Database connection test failed on startup:', err.message);
    console.log('Server will continue, but database operations may fail');
});

module.exports = {
    pool,
    query
};
