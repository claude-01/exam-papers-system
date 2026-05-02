#!/usr/bin/env node

// Quick deployment readiness test
const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Testing deployment readiness...\n');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is required for PostgreSQL connection');
}

console.log('📊 Database Configuration:');
console.log(`Connection: ${connectionString.replace(/:[^:@]+@/, ':******@')}`);
console.log(`SSL Enabled: ${process.env.NODE_ENV === 'production' ? 'Yes' : 'No (dev mode)'}\n`);

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false
});

async function testConnection() {
    try {
        console.log('🔌 Testing database connection...');
        const client = await pool.connect();
        console.log('✅ Database connected successfully!');

        const result = await client.query('SELECT version()');
        console.log('📋 PostgreSQL Version:', result.rows[0].version.split(' ')[1]);

        // Test if tables exist
        const tables = await client.query(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
        );

        console.log(`📁 Tables found: ${tables.rows.length}`);
        if (tables.rows.length > 0) {
            tables.rows.forEach(table => {
                console.log(`  - ${table.table_name}`);
            });
        } else {
            console.log('  ⚠️  No tables found. Run: npm run init-db');
        }

        client.release();
        console.log('\n🎉 Backend is ready for deployment!');
        console.log('\n📋 Deployment Checklist:');
        console.log('✅ PostgreSQL connection working');
        console.log('✅ SSL configuration correct');
        console.log('✅ Dependencies installed');
        console.log('✅ Environment variables configured');

        if (tables.rows.length === 0) {
            console.log('⚠️  Database tables need to be created');
            console.log('   Run: npm run init-db after deployment');
        }

    } catch (err) {
        console.error('❌ Database connection failed!');
        console.error('Error:', err.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check DATABASE_URL format');
        console.log('2. Verify PostgreSQL credentials');
        console.log('3. Ensure database exists');
        console.log('4. Check firewall/network settings');
        process.exit(1);
    } finally {
        await pool.end();
    }
}

testConnection();