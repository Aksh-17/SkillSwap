// routes/swaps.js - Send, View, Accept, Reject, Cancel Swaps

const express = require('express');
const db      = require('../db');
const router  = express.Router();


// SEND A SWAP REQUEST
// POST /api/swaps
// Body: { sender_id, receiver_id, message }
router.post('/', async (req, res) => {
  const { sender_id, receiver_id, message } = req.body;

  if (!sender_id || !receiver_id) {
    return res.json({ success: false, error: 'sender_id and receiver_id are required' });
  }

  if (sender_id == receiver_id) {
    return res.json({ success: false, error: "You can't swap with yourself!" });
  }

  // Check message length
  if (message && message.length > 500) {
    return res.json({ success: false, error: 'Message too long (max 500 characters)' });
  }

  try {
    // Check for duplicate — don't allow sending another request
    // to the same person if one is still pending
    const [existing] = await db.execute(
      `SELECT id FROM swap_requests
       WHERE sender_id = ? AND receiver_id = ? AND status = 'pending'`,
      [sender_id, receiver_id]
    );

    if (existing.length > 0) {
      return res.json({
        success: false,
        error: 'You already have a pending request with this person'
      });
    }

    await db.execute(
      'INSERT INTO swap_requests (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [sender_id, receiver_id, message || '']
    );

    res.json({ success: true });

  } catch (error) {
    res.json({ success: false, error: 'Something went wrong' });
  }
});


// GET MY SWAPS
// GET /api/swaps?user_id=3
router.get('/', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.json({ success: false, error: 'user_id is required' });
  }

  try {
    const [rows] = await db.execute(`
      SELECT
        swap_requests.id,
        swap_requests.message,
        swap_requests.status,
        swap_requests.created_at,
        sender.id     AS sender_id,
        sender.name   AS sender_name,
        receiver.id   AS receiver_id,
        receiver.name AS receiver_name
      FROM swap_requests
      JOIN users AS sender   ON swap_requests.sender_id   = sender.id
      JOIN users AS receiver ON swap_requests.receiver_id = receiver.id
      WHERE swap_requests.sender_id = ? OR swap_requests.receiver_id = ?
      ORDER BY swap_requests.created_at DESC
    `, [user_id, user_id]);

    res.json({ success: true, swaps: rows });

  } catch (error) {
    res.json({ success: false, error: 'Something went wrong' });
  }
});


// ACCEPT OR REJECT A SWAP
// PUT /api/swaps/:id
// Body: { user_id, status }  -- status = 'accepted' or 'rejected'
router.put('/:id', async (req, res) => {
  const { user_id, status } = req.body;
  const swap_id = req.params.id;

  if (status !== 'accepted' && status !== 'rejected') {
    return res.json({ success: false, error: 'Status must be accepted or rejected' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM swap_requests WHERE id = ?', [swap_id]
    );

    if (rows.length === 0) {
      return res.json({ success: false, error: 'Swap not found' });
    }

    // Only the receiver can accept or reject
    if (rows[0].receiver_id != user_id) {
      return res.json({ success: false, error: 'Only the receiver can accept or reject' });
    }

    await db.execute(
      'UPDATE swap_requests SET status = ? WHERE id = ?',
      [status, swap_id]
    );

    res.json({ success: true });

  } catch (error) {
    res.json({ success: false, error: 'Something went wrong' });
  }
});


// CANCEL A SWAP (sender cancels their own pending request)
// DELETE /api/swaps/:id
// Body: { user_id }
router.delete('/:id', async (req, res) => {
  const { user_id } = req.body;
  const swap_id     = req.params.id;

  try {
    // Only the sender can cancel, and only if still pending
    const [result] = await db.execute(
      `DELETE FROM swap_requests
       WHERE id = ? AND sender_id = ? AND status = 'pending'`,
      [swap_id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.json({ success: false, error: 'Cannot cancel this request' });
    }

    res.json({ success: true });

  } catch (error) {
    res.json({ success: false, error: 'Something went wrong' });
  }
});


module.exports = router;
