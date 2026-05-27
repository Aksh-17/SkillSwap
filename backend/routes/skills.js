// routes/skills.js - Add, Delete, View Skills

const express = require('express');
const db      = require('../db');
const router  = express.Router();


// GET ALL USERS WITH THEIR SKILLS
router.get('/', async (req, res) => {
  const { type } = req.query;

  try {
    let query = `
      SELECT
        users.id       AS user_id,
        users.name     AS user_name,
        users.location,
        skills.id      AS skill_id,
        skills.name    AS skill_name,
        skills.type
      FROM skills
      JOIN users ON skills.user_id = users.id
    `;

    const params = [];

    // If type filter is provided, add WHERE clause
    if (type === 'offer' || type === 'want') {
      query += ' WHERE skills.type = ?';
      params.push(type);
    }

    query += ' ORDER BY users.name';

    const [rows] = await db.execute(query, params);

    // Group skills under each user
    const usersMap = {};
    rows.forEach(row => {
      if (!usersMap[row.user_id]) {
        usersMap[row.user_id] = {
          id:       row.user_id,
          name:     row.user_name,
          location: row.location,
          skills:   []
        };
      }
      usersMap[row.user_id].skills.push({
        id:   row.skill_id,
        name: row.skill_name,
        type: row.type
      });
    });

    res.json({ success: true, users: Object.values(usersMap) });

  } catch (error) {
    res.json({ success: false, error: 'Something went wrong' });
  }
});


// GET MY SKILLS
router.get('/mine', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.json({ success: false, error: 'user_id is required' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM skills WHERE user_id = ? ORDER BY type, name',
      [user_id]
    );

    res.json({ success: true, skills: rows });

  } catch (error) {
    res.json({ success: false, error: 'Something went wrong' });
  }
});


// ADD A SKILL
router.post('/', async (req, res) => {
  const { user_id, name, type } = req.body;

  if (!user_id || !name || !type) {
    return res.json({ success: false, error: 'user_id, name and type are required' });
  }

  if (name.length > 100) {
    return res.json({ success: false, error: 'Skill name too long (max 100 chars)' });
  }

  if (type !== 'offer' && type !== 'want') {
    return res.json({ success: false, error: 'Type must be offer or want' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO skills (user_id, name, type) VALUES (?, ?, ?)',
      [user_id, name, type]
    );

    res.json({ success: true, id: result.insertId });

  } catch (error) {
    res.json({ success: false, error: 'Something went wrong' });
  }
});


// DELETE A SKILL
router.delete('/:id', async (req, res) => {
  const { user_id } = req.body;
  const skill_id    = req.params.id;

  try {
    const [result] = await db.execute(
      'DELETE FROM skills WHERE id = ? AND user_id = ?',
      [skill_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.json({ success: false, error: 'Skill not found' });
    }

    res.json({ success: true });

  } catch (error) {
    res.json({ success: false, error: 'Something went wrong' });
  }
});


module.exports = router;
