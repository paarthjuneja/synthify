const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth'); // Our middleware to verify the token
const User = require('../../models/User');    // The User model

// @route   GET /api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        // The 'auth' middleware runs first, verifies the token, and adds the
        // user's id to the request object (req.user.id).
        
        // We find the user by their ID and use .select('-password') to
        // exclude the hashed password from the response for security.
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/users/me
// @desc    Update current user's profile
// @access  Private
router.put('/me', auth, async (req, res) => {
    // Get the new name and organization from the request body
    const { name, organization } = req.body;

    // Build the user object with the fields we want to update
    const userFields = {};
    if (name) userFields.name = name;
    if (organization) userFields.organization = organization;

    try {
        // Find the user by their ID and update their document
        let user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: userFields },
            { new: true } // This option returns the document after it has been updated
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;