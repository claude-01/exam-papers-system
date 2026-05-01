#!/usr/bin/env node

const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
    let connection;
    try {
        console.log("🚀 Initializing MySQL database...");

        // Create connection to MySQL server
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        // Create database if it doesn't exist
        const dbName = process.env.DB_NAME || 'exam_system';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`✅ Database '${dbName}' created or already exists`);

        // Switch to the database
        await connection.query(`USE \`${dbName}\``);

        // Create tables
        console.log("🚀 Creating tables...");

        // Users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created');

        // Exam papers table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS exam_papers (
                id INT PRIMARY KEY AUTO_INCREMENT,
                year INT NOT NULL,
                subject VARCHAR(100) NOT NULL,
                level ENUM('Primary', 'O-Level', 'A-Level') NOT NULL,
                category ENUM('General', 'TVET') DEFAULT 'General',
                trade_or_combination VARCHAR(100),
                file_path VARCHAR(255) NOT NULL,
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_year (year),
                INDEX idx_level (level),
                INDEX idx_category (category),
                INDEX idx_status (status)
            )
        `);
        console.log('✅ Exam papers table created');

        // Site visits table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS site_visits (
                id INT PRIMARY KEY AUTO_INCREMENT,
                ip_address VARCHAR(45),
                user_agent TEXT,
                visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_visited_at (visited_at)
            )
        `);
        console.log('✅ Site visits table created');

        // Downloads table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS downloads (
                id INT PRIMARY KEY AUTO_INCREMENT,
                paper_id INT NOT NULL,
                downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (paper_id) REFERENCES exam_papers(id) ON DELETE CASCADE,
                INDEX idx_paper_id (paper_id)
            )
        `);
        console.log('✅ Downloads table created');

        // Comments table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                paper_id INT NOT NULL,
                user_name VARCHAR(100) NOT NULL,
                user_email VARCHAR(100),
                comment TEXT NOT NULL,
                is_admin_comment BOOLEAN DEFAULT FALSE,
                parent_id INT,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (paper_id) REFERENCES exam_papers(id) ON DELETE CASCADE,
                FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
                INDEX idx_paper_id (paper_id)
            )
        `);
        console.log('✅ Comments table created');

        // Bookmarks table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bookmarks (
                id INT PRIMARY KEY AUTO_INCREMENT,
                paper_id INT NOT NULL,
                ip_address VARCHAR(45),
                bookmarked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (paper_id) REFERENCES exam_papers(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Bookmarks table created');

        // Insert sample data
        console.log('🚀 Inserting sample data...');
        
        const sampleData = [
            { year: 2024, subject: 'Mathematics', level: 'O-Level', category: 'General', trade: null },
            { year: 2024, subject: 'English', level: 'O-Level', category: 'General', trade: null },
            { year: 2024, subject: 'Physics', level: 'A-Level', category: 'General', trade: null },
            { year: 2023, subject: 'Mathematics', level: 'O-Level', category: 'General', trade: null },
            { year: 2023, subject: 'Chemistry', level: 'A-Level', category: 'General', trade: null },
            { year: 2023, subject: 'Biology', level: 'A-Level', category: 'TVET', trade: null }
        ];

        for (const data of sampleData) {
            await connection.query(
                `INSERT IGNORE INTO exam_papers (year, subject, level, category, trade_or_combination, file_path, status)
                 VALUES (?, ?, ?, ?, ?, ?, 'active')`,
                [data.year, data.subject, data.level, data.category, data.trade, `uploads/${data.subject.toLowerCase()}_${data.year}.pdf`]
            );
        }
        console.log('✅ Sample data inserted');

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