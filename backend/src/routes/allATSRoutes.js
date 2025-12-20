// routes/matchRoutes.js
const express = require('express');
const axios = require('axios');

const router = express.Router();

// POST /api/match
router.post('/', async (req, res) => {
  try {
    const { job_desc, job_domain } = req.body;
    console.log("Forwarding request to Python service:", { job_desc, job_domain });
    // Forward the request to the Python Flask service
    const response = await axios.post('http://localhost:8001/ats_match_all', {
      job_desc,
      job_domain
    });

    res.json(response.data);
  } catch (err) {
    console.error('Error contacting Python service:', err.message);
    res.status(500).json({ error: 'Error contacting Python service' });
  }
});

module.exports = router;
