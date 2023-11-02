const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Admin = require('./adminSchema');

const produkSchema = new Schema({
    namaProduk: {
        type: String,
        required: true
    },
    hargaProduk: {
        type: Number,
        required: true
    },
    stokProduk: {
        type: Number,
        required: true
    },
    kategoriProduk: {
        type: String,
        required: true,
        enum : ['Makanan','Minuman','Lainnya']
    },
    gambarProduk: {
        type: String,
        required: false
    },
    idAdmin: {
        type: Schema.Types.ObjectId,
        ref: 'Admin',
        required: false
    }
});

module.exports = mongoose.model('Produk', produkSchema);