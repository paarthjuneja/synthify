const mongoose = require('mongoose');

const DataRequestSchema = new mongoose.Schema({
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId, // Creates a link to a User document
        ref: 'User',
        required: true,
    },
    filters: {
        type: Object, // Stores the researcher's desired filters, e.g., { "AGE": { "$gt": 60 } }
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['open', 'fulfilled', 'pending'], // The status can only be one of these values
        default: 'open',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('DataRequest', DataRequestSchema);