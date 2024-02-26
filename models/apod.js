const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const apodSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: {type: String, requires: true},
    date: { type: Date, default: Date.now, required: true },
    apodData: { type: Object, required: true }
});

const APOD = mongoose.model('APOD', apodSchema);

module.exports = APOD;
