const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Import mongoose
require('dotenv').config(); // Add this line to load the .env file

const app = express();

app.use(cors());
app.use(express.json());

// --- Connect to MongoDB ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected successfully.'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
// -------------------------

// --- Define API Routes ---
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/ingest', require('./routes/api/ingest'));
app.use('/api/datasets', require('./routes/api/datasets'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/requests', require('./routes/api/requests'));
app.use('/api/predict', require('./routes/api/predict'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));