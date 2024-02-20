const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:  { type: String },
    history: { type: Array, required: false }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
