const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Admin = require('./user-schema');

const pendapatanSchema = new Schema({
    pendapatanMakanan: {
        type: Number,
        required: true,
        default: 0
    },
    pendapatanMinuman: {
        type: Number,
        required: true,
        default: 0
    },
    totalPendapatan: {
        type: Number,
        required: true
    },
    tanggalPendapatan: {
        type: Date,
        required: true
    },
    idModal: {
        type: Schema.Types.ObjectId,
        ref: 'Modal',
        required: false
    },
    idPengeluaran: {
        type: Schema.Types.ObjectId,
        ref: 'Pengeluaran',
        required: false
    },
    pendapatanBersih: {
        type: Number,
        required: false
    },
    idAdmin: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: false
    },
});

module.exports = mongoose.model('Pendapatan', pendapatanSchema);