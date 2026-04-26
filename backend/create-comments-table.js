const mysql = require('mysql2');
require('dotenv').config();

console.log('\n🔧 Creating Comments Table');
console.log('================================');

const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'exam_system'
};

const connection = mysql.createConnection(config);

connection.connect((err) => {
    if (err) {
        console.error('❌ Connection failed!');
        console.error('Error:', err.message);
        process.exit(1);
    }
    
    console.log('✅ Connected to database!');
    
    // Create comments table
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            paper_id VARCHAR(50) NOT NULL,
            user_name VARCHAR(100) NOT NULL,
            user_email VARCHAR(100) NULL,
            comment TEXT NOT NULL,
            is_admin_comment BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            INDEX idx_paper_id (paper_id),
            INDEX idx_created_at (created_at)
        )
    `;
    
    connection.query(createTableSQL, (err, result) => {
        if (err) {
            console.error('❌ Failed to create table:', err.message);
            process.exit(1);
        }
        
        console.log('✅ Comments table created successfully!');
        
        // Check if table exists
        connection.query('SHOW TABLES LIKE "comments"', (err, result) => {
            if (err) {
                console.error('❌ Failed to verify table:', err.message);
            } else {
                if (result.length > 0) {
                    console.log('✅ Table verified: comments table exists');
                } else {
                    console.log('❌ Table verification failed');
                }
            }
            
            connection.end();
            console.log('\n✅ Setup complete');
        });
    });
});
