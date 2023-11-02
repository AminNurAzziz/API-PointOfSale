const express = require('express');
const router = express.Router();
const Transaksi = require('../controllers/transaksiController');

router.route('/transaksi')
    .get(Transaksi.getAllTransaksi)

router.route('/addTransaksi')
    .post(Transaksi.addTransaksi)

module.exports = router;