const express = require('express');
const router = express.Router();
const Produk = require('../controllers/produkController');

router.route('/produk')
    .get(Produk.getAllProduk)

router.route('/tambahProduk')
    .post(Produk.addProduk)

router.route('/produk/:id')
    .get(Produk.getDetailProduk)

router.route('/updateProduk/:id')
    .put(Produk.updateProduk)

router.route('/deleteProduk/:id')
    .delete(Produk.deleteProduk)

module.exports = router;

