const mongoose = require('mongoose');

const DatasetSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId, // A reference to the User who owns it
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    filtersUsed: {
        type: Object, // We'll store the JSON filters they used
    },
    timelines: {
        type: Array, // This will hold the array of synthetic timeline objects
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Dataset', DatasetSchema);