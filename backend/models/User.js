const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: ['researcher', 'hospital_admin'], // The role must be one of these two values
    },
    organization: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// This is a special Mongoose "middleware" that runs automatically
// right BEFORE a new user document is saved to the database.
UserSchema.pre('save', async function(next) {
    // We only hash the password if it's a new user or the password is being changed
    if (!this.isModified('password')) {
        return next();
    }
    
    // Generate a "salt" to make the hash more secure
    const salt = await bcrypt.genSalt(10);
    // Replace the plain text password with the hashed password
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

module.exports = mongoose.model('User', UserSchema);
