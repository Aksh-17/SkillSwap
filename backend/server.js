// server.js - Run with: node server.js

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');
require('dotenv').config();

const app = express();

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve uploaded videos at /uploads/filename.mp4
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/swaps',  require('./routes/swaps'));
app.use('/api/videos', require('./routes/videos'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('SkillSwap running at http://localhost:' + PORT);
});
