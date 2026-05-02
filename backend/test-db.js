const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'exam_system'
};

console.log('\n🔍 Testing MySQL Database Connection');
console.log('================================');
console.log('Configuration:');
console.log(`Host: ${dbConfig.host}`);
console.log(`Database: ${dbConfig.database}`);
console.log(`User: ${dbConfig.user}`);
console.log('================================');

(async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected successfully!');

        const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
        console.log('✅ Query test passed:', rows[0].solution);

        const [tables] = await connection.execute(
            `SHOW TABLES`
        );

        console.log(`\nTables in database (${tables.length}):`);
        if (tables.length === 0) {
            console.log('  No tables found. Run init-db.js to create the required tables.');
        } else {
            tables.forEach(table => {
                console.log(`  - ${Object.values(table)[0]}`);
            });
        }

        console.log('\n✅ Test complete');
    } catch (err) {
        console.error('❌ Connection failed!');
        console.error('Error:', err.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
})();
    }
})();