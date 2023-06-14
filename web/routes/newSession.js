const express = require('express');
const hat = require('hat');

const router = express.Router();

router.get('/', (req, res) => {
  const token = hat();
  res.json({ token });
});

module.exports = router;
