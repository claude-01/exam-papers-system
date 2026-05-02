const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'exam_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

console.log('🔐 Database config loaded for:', dbConfig.host, dbConfig.database);

let pool;

async function createPool() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('✅ MySQL connection pool created successfully');
        return pool;
    } catch (err) {
        console.error('❌ Failed to create MySQL connection pool:', err.message);
        throw err;
    }
}

async function testDatabaseConnection() {
    try {
        if (!pool) await createPool();
        const connection = await pool.getConnection();
        await connection.execute('SELECT 1');
        connection.release();
        console.log('✅ MySQL database connected successfully');
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        return false;
    }
}

async function query(sql, params = []) {
    try {
        if (!pool) await createPool();
        const [rows, fields] = await pool.execute(sql, params);

        // For SELECT queries, return rows
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
            return [rows, { rowCount: rows.length }];
        }

        // For INSERT/UPDATE/DELETE, return affected rows info
        const meta = {
            rowCount: rows.affectedRows || 0,
            affectedRows: rows.affectedRows || 0,
            insertId: rows.insertId || null
        };

        return [meta, { rowCount: rows.affectedRows }];
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
    query,
    testDatabaseConnection
};
