#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error('DATABASE_URL is required for PostgreSQL connection');
}

const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false
});

async function initializeDatabase() {
    let client;
    try {
        console.log('🚀 Initializing PostgreSQL database...');
        client = await pool.connect();

        console.log('🚀 Creating tables...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created');

        await client.query(`
            CREATE TABLE IF NOT EXISTS exam_papers (
                id SERIAL PRIMARY KEY,
                year INT NOT NULL,
                subject VARCHAR(100) NOT NULL,
                level VARCHAR(50) NOT NULL,
                category VARCHAR(50) DEFAULT 'General',
                trade_or_combination VARCHAR(100),
                file_path TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Exam papers table created');

        await client.query(`
            CREATE TABLE IF NOT EXISTS site_visits (
                id SERIAL PRIMARY KEY,
                ip_address VARCHAR(45),
                user_agent TEXT,
                visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Site visits table created');

        await client.query(`
            CREATE TABLE IF NOT EXISTS downloads (
                id SERIAL PRIMARY KEY,
                paper_id INT NOT NULL REFERENCES exam_papers(id) ON DELETE CASCADE,
                downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Downloads table created');

        await client.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                paper_id INT NOT NULL REFERENCES exam_papers(id) ON DELETE CASCADE,
                user_name VARCHAR(100) NOT NULL,
                user_email VARCHAR(100),
                comment TEXT NOT NULL,
                is_admin_comment BOOLEAN DEFAULT FALSE,
                parent_id INT REFERENCES comments(id) ON DELETE CASCADE,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Comments table created');

        await client.query(`
            CREATE TABLE IF NOT EXISTS bookmarks (
                id SERIAL PRIMARY KEY,
                paper_id INT NOT NULL REFERENCES exam_papers(id) ON DELETE CASCADE,
                ip_address VARCHAR(45),
                bookmarked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Bookmarks table created');

        console.log('\n✨ PostgreSQL database initialization complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
    }
}

initializeDatabase();