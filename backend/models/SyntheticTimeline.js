const mongoose = require('mongoose');

// This schema will store the timelines uploaded by hospitals.
// For now, we'll keep it simple. We can make it more complex later.
const SyntheticTimelineSchema = new mongoose.Schema({
    patient_id: {
        type: String,
        required: true,
    },
    events: {
        type: [String], // An array of event tokens
        required: true,
    },
    source_hospital: {
        type: String, // We can store which hospital it came from
    }
});

module.exports = mongoose.model('SyntheticTimeline', SyntheticTimelineSchema);