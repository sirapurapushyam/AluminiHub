const express = require('express');
const axios = require('axios');
const router = express.Router();

// POST /api/student-ats
router.post('/', async (req, res) => {
  const { student_id, job_desc, job_domain } = req.body;
  try {
    console.log("Forwarding request to Python service:", { student_id, job_desc, job_domain });
    const pyResp = await axios.post('http://localhost:8001/ats_match_student', {
      student_id,
      job_desc,
      job_domain
    });
    res.json(pyResp.data);
  } catch (err) {
    console.error('Error contacting Python service:', err.message);
    res.status(500).json({ error: 'Error contacting Python service' });
  }
});

module.exports = router;
