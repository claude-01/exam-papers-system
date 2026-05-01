const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,        // ❌ removed localhost fallback
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

const promisePool = pool.promise();

// Test database connection (SAFE - won't crash app)
async function testDatabaseConnection() {
    try {
        const connection = await promisePool.getConnection();
        console.log('✅ Database connected successfully');

        await connection.query('SELECT 1');
        console.log('✅ Database query test passed');

        connection.release();
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);

        console.log('⚠️ Server will continue running without DB connection');
    }
}

// Run test (non-blocking)
testDatabaseConnection();

// Handle connection errors safely
pool.on('error', (err) => {
    console.error('❌ Database pool error:', err.message);

    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('⚠️ Database connection lost');
    }
});

module.exports = promisePool;
