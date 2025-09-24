const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const DataRequest = require('../../models/DataRequest');

// @route   POST /api/requests
// @desc    Create a new data request
// @access  Private (Researcher only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'researcher') {
        return res.status(403).json({ msg: 'Forbidden: Only researchers can create data requests.' });
    }

    const { filters } = req.body;

    // Basic validation to ensure filters are provided
    if (!filters || Object.keys(filters).length === 0) {
        return res.status(400).json({ msg: 'Filters are required to create a request.' });
    }

    try {
        const newDataRequest = new DataRequest({
            requestedBy: req.user.id,
            filters: filters,
        });

        const dataRequest = await newDataRequest.save();
        res.status(201).json(dataRequest); // 201 status means "Created"

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

// ... (keep the existing POST '/' route)

// @route   GET /api/requests
// @desc    Get all open data requests
// @access  Private (Hospital Admin only)
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'hospital_admin') {
        return res.status(403).json({ msg: 'Forbidden: Only hospital admins can view data requests.' });
    }

    try {
        // Find all requests where the status is 'open' and sort by newest first
        const openRequests = await DataRequest.find({ status: 'open' }).sort({ createdAt: -1 });
        res.json(openRequests);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

// ... (keep the existing POST '/' route)

// @route   GET /api/requests
// @desc    Get all open data requests
// @access  Private (Hospital Admin only)
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'hospital_admin') {
        return res.status(403).json({ msg: 'Forbidden: Only hospital admins can view data requests.' });
    }

    try {
        // Find all requests where the status is 'open' and sort by newest first
        const openRequests = await DataRequest.find({ status: 'open' }).sort({ createdAt: -1 });
        res.json(openRequests);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;