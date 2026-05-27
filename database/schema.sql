-- SkillSwap Final - Database Setup
-- Run this in MySQL to create everything

CREATE DATABASE IF NOT EXISTS skillswap_final;
USE skillswap_final;

-- TABLE 1: users
CREATE TABLE users (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(100) NOT NULL UNIQUE,
  password  VARCHAR(100) NOT NULL,
  location  VARCHAR(100) DEFAULT ''
);

-- TABLE 2: skills
-- type = 'offer' (I can teach this) or 'want' (I want to learn this)
CREATE TABLE skills (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id  INT NOT NULL,
  name     VARCHAR(100) NOT NULL,
  type     VARCHAR(10)  NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- TABLE 3: swap_requests
-- status = 'pending', 'accepted', 'rejected'
CREATE TABLE swap_requests (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  sender_id   INT NOT NULL,
  receiver_id INT NOT NULL,
  message     VARCHAR(500) DEFAULT '',
  status      VARCHAR(20)  DEFAULT 'pending',
  created_at  DATETIME     DEFAULT NOW(),
  FOREIGN KEY (sender_id)   REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- TABLE 4: videos
-- Skill owners can upload video lectures for their offered skills
CREATE TABLE videos (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  skill_id   INT NOT NULL,
  user_id    INT NOT NULL,
  title      VARCHAR(200) NOT NULL,
  filename   VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT NOW(),
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE
);

-- Sample users
INSERT INTO users (name, email, password, location) VALUES
('Riya Sharma',  'riya@test.com',  'riya123',  'Delhi'),
('Arjun Mehta',  'arjun@test.com', 'arjun123', 'Mumbai'),
('Priya Singh',  'priya@test.com', 'priya123', 'Bangalore');

-- Sample skills
INSERT INTO skills (user_id, name, type) VALUES
(1, 'Web Development', 'offer'),
(1, 'Graphic Design',  'want'),
(2, 'Python',          'offer'),
(2, 'Video Editing',   'want'),
(3, 'UI Design',       'offer'),
(3, 'JavaScript',      'want');
