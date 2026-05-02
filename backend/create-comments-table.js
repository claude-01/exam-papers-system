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

(async () => {
    let client;
    try {
        console.log('\n🔧 Creating Comments Table');
        console.log('================================');

        client = await pool.connect();
        console.log('✅ Connected to PostgreSQL');

        await client.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                paper_id INT NOT NULL REFERENCES exam_papers(id) ON DELETE CASCADE,
                user_name VARCHAR(100) NOT NULL,
                user_email VARCHAR(100),
                comment TEXT NOT NULL,
                is_admin_comment BOOLEAN DEFAULT FALSE,
                parent_id INT REFERENCES comments(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_comments_paper_id ON comments(paper_id)
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at)
        `);

        console.log('✅ Comments table created successfully!');

        const { rows } = await client.query(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comments'`
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
        if (client) client.release();
        await pool.end();
    }
})();