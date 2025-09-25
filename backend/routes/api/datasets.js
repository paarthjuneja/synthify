const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Dataset = require('../../models/Dataset');
const SyntheticTimeline = require('../../models/SyntheticTimeline');
const { Parser } = require('json2csv');

// @route   GET /api/datasets
// @desc    Get all datasets for the logged-in researcher
// @access  Private (Researcher only)
router.get('/', auth, async (req, res) => {
    if (req.user.role !== 'researcher') {
        return res.status(403).json({ msg: 'Forbidden: Access is limited to researchers.' });
    }
    try {
        const datasets = await Dataset.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.json(datasets);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/datasets/request
// @desc    Request and create a new custom dataset
// @access  Private (Researcher only)
router.post('/request', auth, async (req, res) => {
    if (req.user.role !== 'researcher') {
        return res.status(403).json({ msg: 'Forbidden: Access is limited to researchers.' });
    }
    const { name, filters } = req.body;
    // Basic validation
    if (!name || !filters) {
        return res.status(400).json({ msg: 'Dataset name and filters are required.' });
    }
    try {
        // A realistic limit to prevent overwhelming queries
        const limit = 100; 
        const timelines = await SyntheticTimeline.find(filters).limit(limit);

        if (!timelines || timelines.length === 0) {
            return res.status(404).json({ msg: 'No timelines found matching the specified criteria.' });
        }
        const newDataset = new Dataset({
            owner: req.user.id,
            name,
            filtersUsed: filters,
            timelines: timelines,
        });
        const dataset = await newDataset.save();
        res.status(201).json(dataset); // Use 201 for resource creation
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/datasets/:id
// @desc    Get a single dataset by its ID
// @access  Private (Researcher only)
router.get('/:id', auth, async (req, res) => {
    try {
        const dataset = await Dataset.findById(req.params.id);
        if (!dataset) {
            return res.status(404).json({ msg: 'Dataset not found' });
        }
        if (dataset.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        res.json(dataset);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/datasets/:id/download
// @desc    Download a specific dataset as a CSV
// @access  Private (Researcher only)
router.get('/:id/download', auth, async (req, res) => {
    try {
        const dataset = await Dataset.findById(req.params.id);
        if (!dataset) {
            return res.status(404).json({ msg: 'Dataset not found' });
        }
        if (dataset.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(dataset.timelines);

        res.header('Content-Type', 'text/csv');
        res.attachment(`dataset-${dataset._id}.csv`);
        res.send(csv);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// This should be the ONLY export in the file, and it must be at the end.
module.exports = router;