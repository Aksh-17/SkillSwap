// routes/auth.js - Register, Login, Edit Profile

const express = require('express');
const db      = require('../db');
const router  = express.Router();


// REGISTER
// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, location } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, error: 'Name, email and password are required' });
  }

  // Limit input lengths
  if (name.length > 100 || email.length > 100 || password.length > 100) {
    return res.json({ success: false, error: 'Input too long' });
  }

  try {
    // Check if email already taken
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ?', [email]
    );
    if (existing.length > 0) {
      return res.json({ success: false, error: 'Email already registered' });
    }

    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, location) VALUES (?, ?, ?, ?)',
      [name, email, password, location || '']
    );

    res.json({
      success: true,
      user: { id: result.insertId, name, email, location: location || '' }
    });

  } catch (error) {
    console.log(error);
    res.json({ success: false, error: 'Something went wrong' });
  }
});


// LOGIN
// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, error: 'Email and password are required' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, location FROM users WHERE email = ? AND password = ?',
      [email, password]
    );

    if (rows.length === 0) {
      return res.json({ success: false, error: 'Wrong email or password' });
    }

    res.json({ success: true, user: rows[0] });

  } catch (error) {
    res.json({ success: false, error: 'Something went wrong' });
  }
});


// GET USER PROFILE
// GET /api/users/:id
router.get('/users/:id', async (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) {
    return res.json({ success: false, error: 'Invalid user id' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, location FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user: rows[0] });
  } catch (error) {
    res.json({ success: false, error: 'Something went wrong' });
  }
});


// EDIT PROFILE
// PUT /api/auth/edit
// Body: { user_id, name, location }
router.put('/edit', async (req, res) => {
  const { user_id, name, location } = req.body;

  if (!user_id || !name) {
    return res.json({ success: false, error: 'user_id and name are required' });
  }

  if (name.length > 100) {
    return res.json({ success: false, error: 'Name too long' });
  }

  try {
    await db.execute(
      'UPDATE users SET name = ?, location = ? WHERE id = ?',
      [name, location || '', user_id]
    );

    res.json({ success: true, name, location: location || '' });

  } catch (error) {
    res.json({ success: false, error: 'Something went wrong' });
  }
});


module.exports = router;
