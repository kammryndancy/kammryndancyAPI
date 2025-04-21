const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  let dbStatus = 'unknown';
  if (dbState === 1) dbStatus = 'connected';
  else if (dbState === 2) dbStatus = 'connecting';
  else if (dbState === 0) dbStatus = 'disconnected';
  else if (dbState === 3) dbStatus = 'disconnecting';
  res.json({ status: 'ok', db: dbStatus });
});

router.get('/open', (req, res) => {
  res.json({ status: 'ok', ...req.body });
});

module.exports = router;
