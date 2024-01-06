const express = require('express');
const router = express.Router();
const Produk = require('../controllers/produk-controller');
const { checkAdmin, checkKasir } = require('../middlewareJWT')


router.route('/produk')
    .get(checkAdmin, Produk.getAllProduk)

router.route('/produk/:id')
    .get(Produk.getDetailProduk)

router.route('/addProduk')
    .post(Produk.addProduk)

router.route('/produk/:id/update')
    .put(Produk.updateProduk)

router.route('/produk/:id/delete')
    .delete(Produk.deleteProduk)

module.exports = router;

