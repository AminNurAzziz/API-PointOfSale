const { json } = require('express');
const Transaksi = require('../models/transaksiSchema');
const moment = require('moment'); // Import library moment untuk memformat tanggal

class TransaksiController{
    static async getAllTransaksi(req, res, next) {
        Transaksi.find({})
        .then((transaksi) => {
            // Memformat tanggal dan waktu untuk setiap transaksi
            const formattedTransaksi = transaksi.map((t) => ({
                jumlahProduk: t.jumlahProduk,
                totalHarga: t.totalHarga,
                tanggalTransaksi: moment(t.tanggalTransaksi).format('DD-MM-YYYY'),
                waktu: moment(t.tanggalTransaksi).format('HH:mm:ss'), // Memformat jam:menit
                idProduk: t.idProduk,
                idKasir: t.idKasir,
                idAdmin: t.idAdmin,
            }));
            res.status(200).json({
                error: false,
                message: 'success',
                data: formattedTransaksi
            });
        })
        .catch((err) => {
            next(err);
        });
    }

    static async addTransaksi(req, res, next) {
        try{
            const transaksi = new Transaksi(req.body);
            await transaksi.save();
            res.status(201).json({
                error: false,
                message: 'success'
            });
        }
        catch(err){
            next(err);
        }
    }
}

module.exports = TransaksiController;