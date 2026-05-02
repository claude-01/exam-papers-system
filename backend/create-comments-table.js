const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'exam_system'
};

(async () => {
    let connection;
    try {
        console.log('\n🔧 Creating Comments Table');
        console.log('================================');

        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL');

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

        await connection.execute(`
            CREATE INDEX idx_comments_paper_id ON comments(paper_id)
        `);
        await connection.execute(`
            CREATE INDEX idx_comments_created_at ON comments(created_at)
        `);

        console.log('✅ Comments table created successfully!');

        const [rows] = await connection.execute(
            `SHOW TABLES LIKE 'comments'`
        );

        if (rows.length > 0) {
            console.log('✅ Table verified: comments table exists');
        } else {
            console.log('❌ Table verification failed');
        }

        console.log('\n✅ Setup complete');
    } catch (err) {
        console.error('❌ Failed to create comments table:', err.message);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
})();