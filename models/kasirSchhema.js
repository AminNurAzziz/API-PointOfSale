const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const kasirSchema = new Schema({
    namaKasir: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Kasir', kasirSchema);