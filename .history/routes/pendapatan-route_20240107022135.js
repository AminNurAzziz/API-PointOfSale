const express = require('express');
const router = express.Router();
const Pendapatan = require('../controllers/pendapatan-controller');
const { checkAdmin } = require('../middlewareJWT')

router.use(['/pendapatan', '/pendapatan/:id/delete'], [checkAdmin]);

router.route('/pendapatan')
    .get(Pendapatan.getAllPendapatan)

router.route('/pendapatan/:id/delete')
    .delete(Pendapatan.deletePendapatan)

module.exports = router;