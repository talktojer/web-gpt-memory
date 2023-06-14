const express = require('express');
const contextService = require('../services/contextService');

const router = express.Router();

router.get('/', async (req, res) => {
  const { token } = req.query;

  try {
    const chatLog = await contextService.loadContext(token);
    res.json({ chatLog });
  } catch (error) {
    console.error('Error reading chat log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
