#!/usr/bin/env node

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'exam_system',
    multipleStatements: true
};

async function initializeDatabase() {
    let connection;
    try {
        console.log('🚀 Initializing MySQL database...');
        connection = await mysql.createConnection(dbConfig);

        console.log('🚀 Creating tables...');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS exam_papers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                year INT NOT NULL,
                subject VARCHAR(100) NOT NULL,
                level VARCHAR(50) NOT NULL,
                category VARCHAR(50) DEFAULT 'General',
                trade_or_combination VARCHAR(100),
                file_path TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Exam papers table created');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS site_visits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ip_address VARCHAR(45),
                user_agent TEXT,
                visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Site visits table created');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS downloads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                paper_id INT NOT NULL,
                downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (paper_id) REFERENCES exam_papers(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Downloads table created');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS comments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                paper_id INT NOT NULL,
                user_name VARCHAR(100) NOT NULL,
                user_email VARCHAR(100),
                comment TEXT NOT NULL,
                is_admin_comment BOOLEAN DEFAULT FALSE,
                parent_id INT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (paper_id) REFERENCES exam_papers(id) ON DELETE CASCADE,
                FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Comments table created');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS bookmarks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                paper_id INT NOT NULL,
                ip_address VARCHAR(45),
                bookmarked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (paper_id) REFERENCES exam_papers(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Bookmarks table created');

        console.log('\n✨ MySQL database initialization complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initializeDatabase();