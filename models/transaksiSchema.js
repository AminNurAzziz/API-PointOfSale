const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transaksiSchema = new Schema({
    jumlahProduk: {
        type: Number,
        required: true
    },
    totalHarga: {
        type: Number,
        required: true
    },
    tanggalTransaksi: {
        type: Date,
        required: true,
        default: Date.now
    },
    idProduk: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Produk',
            required: true
        },
        jumlahProduk: {
            type: Number,
            required: true
        },
        subTotalProduk: {
            type: Number,
            required: true
        }
    }],    
    idKasir: {
        type: Schema.Types.ObjectId,
        ref: 'Kasir',
        req : function() {
            // Jika idAdmin tidak ada, maka idKasir harus ada
            return !this.idAdmin;
        }
    },
    idAdmin: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        req : function() {
            // Jika idKasir tidak ada, maka idAdmin harus ada
            return !this.idKasir;
        }
    }
});

module.exports = mongoose.model('Transaksi', transaksiSchema);