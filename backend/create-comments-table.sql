-- Create comments table for exam papers system
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
);
