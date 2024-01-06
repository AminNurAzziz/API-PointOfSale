const express = require('express');
const router = express.Router();
const Transaksi = require('../controllers/transaksi-controller');
const { checkAdmin, checkKasir } = require('../middlewareJWT');


router.use(['/transaksi', '/addTransaksi', '/deleteTransaksi/:id'], [checkAdmin, checkKasir]);

router.route('/transaksi')
    .get(Transaksi.getAllTransaksi)

router.route('/addTransaksi')
    .post(Transaksi.addTransaksi)

router.route('/deleteTransaksi/:id')
    .delete(Transaksi.deleteTransaksi)

router.route('/transaksi/30MinutesTransaksi')
    .get(Transaksi.get30MinutesTransaksi)

module.exports = router;