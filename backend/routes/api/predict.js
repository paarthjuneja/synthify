const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../../middleware/auth');

// @route   POST /api/predict/branch
// @desc    Get a "what-if" prediction from the Python AI service
// @access  Private (Researcher only)
router.post('/branch', auth, async (req, res) => {
    if (req.user.role !== 'researcher') {
        return res.status(403).json({ msg: 'Forbidden: Access is limited to researchers.' });
    }

    try {
        // The URL of our Python/Flask AI service
        const pythonApiServiceUrl = 'http://127.0.0.1:5001/predict';

        // Forward the request body from the client to the Python service
        const response = await axios.post(pythonApiServiceUrl, req.body);

        // Send the prediction from the Python service back to the client
        res.json(response.data);

    } catch (err) {
        console.error('Error calling Python AI service:', err.message);
        res.status(500).send('Error communicating with the AI service');
    }
});

module.exports = router;