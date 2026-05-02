const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is required for PostgreSQL connection');
}

console.log('\n🔍 Testing Database Connection');
console.log('================================');
console.log('Configuration:');
console.log(`Connection: ${connectionString.replace(/:[^:@]+@/, ':******@')}`);
console.log('================================');

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false
});

(async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Connected successfully!');

        const result = await client.query('SELECT 1 + 1 AS solution');
        console.log('✅ Query test passed:', result.rows[0].solution);

        const tables = await client.query(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
        );

        console.log(`\nTables in database (${tables.rows.length}):`);
        if (tables.rows.length === 0) {
            console.log('  No tables found. Run init-db.js to create the required tables.');
        } else {
            tables.rows.forEach(table => {
                console.log(`  - ${table.table_name}`);
            });
        }

        client.release();
        console.log('\n✅ Test complete');
    } catch (err) {
        console.error('❌ Connection failed!');
        console.error('Error:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
})();