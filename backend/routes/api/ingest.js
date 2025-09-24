const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs'); // Node.js File System module
const csv = require('csv-parser'); // The CSV parsing library
const auth = require('../../middleware/auth');
const SyntheticTimeline = require('../../models/SyntheticTimeline'); // Our new model
const User = require('../../models/User'); // We need this to get the user's organization

const upload = multer({ dest: 'uploads/' });

router.post('/upload', [auth, upload.single('syntheticFile')], async (req, res) => {
    if (req.user.role !== 'hospital_admin') {
        return res.status(403).json({ msg: 'Forbidden: Access is limited to hospital admins.' });
    }
    if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded.' });
    }

    const results = [];
    const filePath = req.file.path;

    // Get the user's organization to tag the data
    const user = await User.findById(req.user.id);
    const hospitalName = user ? user.organization : 'Unknown Hospital';

    // This block reads the CSV file row by row
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
          // 'data' is a JSON object for each row.
          // We assume the CSV has columns 'patient_id' and 'events'.
          // The 'events' column should be a single string like "event_a,event_b,event_c"
          if (data.patient_id && data.events) {
              results.push({
                  patient_id: data.patient_id,
                  events: data.events.split(','), // Split the string into an array
                  source_hospital: hospitalName
              });
          }
      })
      .on('end', async () => {
          try {
              if (results.length > 0) {
                  // Insert all the parsed rows into the database in one go
                  await SyntheticTimeline.insertMany(results);
                  console.log(`Successfully inserted ${results.length} timelines.`);
              }
              // Delete the temporary file from the server
              fs.unlinkSync(filePath); 
              res.json({ msg: `File processed successfully. Inserted ${results.length} timelines.` });
          } catch (err) {
              console.error(err.message);
              res.status(500).send('Server Error while saving data');
          }
      });
});

module.exports = router;