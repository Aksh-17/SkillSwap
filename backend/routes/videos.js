// routes/videos.js - Upload and view video lectures per skill

const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const db      = require('../db');
const router  = express.Router();

// Multer config — save uploaded videos to backend/uploads/
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },

  // Rename file to avoid conflicts: video_userId_timestamp.mp4
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // e.g. .mp4
    cb(null, `video_${req.body.user_id}_${Date.now()}${ext}`);
  }
});

// Only allow video files
const fileFilter = (req, file, cb) => {
  const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (mp4, webm, ogg, mov)'));
  }
};

const upload = multer({
  storage:    storage,
  fileFilter: fileFilter,
  limits:     { fileSize: 200 * 1024 * 1024 }
});


// GET VIDEOS FOR A SKILL
router.get('/', async (req, res) => {
  const { skill_id } = req.query;

  if (!skill_id) {
    return res.json({ success: false, error: 'skill_id is required' });
  }

  try {
    const [rows] = await db.execute(`
      SELECT videos.*, users.name AS uploader_name
      FROM videos
      JOIN users ON videos.user_id = users.id
      WHERE videos.skill_id = ?
      ORDER BY videos.created_at DESC
    `, [skill_id]);

    res.json({ success: true, videos: rows });

  } catch (error) {
    res.json({ success: false, error: 'Something went wrong' });
  }
});


// UPLOAD A VIDEO
router.post('/upload', (req, res) => {

  upload.single('video')(req, res, async (err) => {

    // Handle multer errors (wrong file type, too large etc.)
    if (err) {
      return res.json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.json({ success: false, error: 'No video file uploaded' });
    }

    const { user_id, skill_id, title } = req.body;

    if (!user_id || !skill_id || !title) {
      // Delete the uploaded file since we can't save it
      fs.unlinkSync(req.file.path);
      return res.json({ success: false, error: 'user_id, skill_id and title are required' });
    }

    if (title.length > 200) {
      fs.unlinkSync(req.file.path);
      return res.json({ success: false, error: 'Title too long (max 200 characters)' });
    }

    try {
      // Make sure the skill belongs to this user
      const [skills] = await db.execute(
        'SELECT id FROM skills WHERE id = ? AND user_id = ?',
        [skill_id, user_id]
      );

      if (skills.length === 0) {
        fs.unlinkSync(req.file.path);
        return res.json({ success: false, error: 'You can only upload videos for your own skills' });
      }

      // Save video info to database
      const [result] = await db.execute(
        'INSERT INTO videos (skill_id, user_id, title, filename) VALUES (?, ?, ?, ?)',
        [skill_id, user_id, title, req.file.filename]
      );

      res.json({
        success:  true,
        video_id: result.insertId,
        filename: req.file.filename
      });

    } catch (error) {
      console.log(error);
      res.json({ success: false, error: 'Something went wrong' });
    }
  });
});


// DELETE A VIDEO
router.delete('/:id', async (req, res) => {
  const { user_id } = req.body;
  const video_id    = req.params.id;

  try {
    // Find the video first to get the filename
    const [rows] = await db.execute(
      'SELECT * FROM videos WHERE id = ? AND user_id = ?',
      [video_id, user_id]
    );

    if (rows.length === 0) {
      return res.json({ success: false, error: 'Video not found' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../uploads', rows[0].filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await db.execute('DELETE FROM videos WHERE id = ?', [video_id]);

    res.json({ success: true });

  } catch (error) {
    res.json({ success: false, error: 'Something went wrong' });
  }
});


module.exports = router;
