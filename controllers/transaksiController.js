const { json } = require('express');
const Transaksi = require('../models/transaksiSchema');
const Produk = require('../models/produkSchema');
const PendapatanController = require('./pendapatanController');
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
        try {
            const transaksiData = req.body;
            const transaksi = new Transaksi(transaksiData);
            transaksi.totalHarga = 0;
            const listProduk = [];

            // Kurangi stok produk
            for(let i = 0; i < transaksiData.idProduk.length; i++){
                const produk = await Produk.findById(transaksiData.idProduk[i]._id);
                listProduk.push(produk);
                if(!produk){
                    return next(new Error('Produk tidak ditemukan'));
                }
                produk.stokProduk -= transaksiData.idProduk[i].jumlahProduk;
                await produk.save();
                transaksi.idProduk[i].subTotalProduk = produk.hargaProduk * transaksiData.idProduk[i].jumlahProduk;
                transaksi.totalHarga += transaksi.idProduk[i].subTotalProduk;
            }
            PendapatanController.addPendapatan(transaksi, listProduk, res);

            await transaksi.save();
            res.status(201).json({
                error: false,
                message: 'success'
            });
        } catch (err) {
            next(err);
        }
    }
    
    

    static async deleteTransaksi(req, res, next) {
        try{
            const { id } = req.params;
            const transaksi = await Transaksi.findByIdAndDelete(id);
            const listProduk = [];
            for(let i = 0; i < transaksi.idProduk.length; i++){
                const produk = await Produk.findById(transaksi.idProduk[i]._id);
                listProduk.push(produk);
                if(!produk){
                    return next(new Error('Produk tidak ditemukan'));
                }
            }
            PendapatanController.decreasePendapatan(transaksi, listProduk);
            if(!transaksi){
                return next(new Error('Transaksi tidak ditemukan'));
            }
            res.status(200).json({
                error: false,
                message: 'success',
                data: transaksi
            });
        }
        catch(err){
            next(err);
        }
    }

    static async get30MinutesTransaksi(req, res, next) {
        try {
            // Ambil semua transaksi dari hari ini
            const startOfDay = moment().startOf('day');
            const endOfDay = moment().endOf('day');
            
            const transaksiToday = await Transaksi.find({
                tanggalTransaksi: {
                    $gte: startOfDay.toDate(),
                    $lte: endOfDay.toDate()
                }
            });
    
            // Inisialisasi struktur data untuk menyimpan transaksi berdasarkan interval 30 menit
            let stats = [];
            for (let hour = 0; hour < 24; hour++) {
                for (let minute of [0, 30]) {
                    stats.push({
                        interval: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
                        totalHarga: 0,
                        totalTransaksi: 0
                    });
                }
            }
    
            // Proses setiap transaksi dan tambahkan ke interval yang sesuai
            for (let trans of transaksiToday) {
                const transTime = moment(trans.tanggalTransaksi);
                const index = transTime.hour() * 2 + Math.floor(transTime.minute() / 30);
                // stats[index].totalHarga += trans.totalHarga + stats[index - 1].totalHarga;
                // stats[index].totalTransaksi += 1 + stats[index - 1].totalTransaksi;
                stats[index].totalHarga += trans.totalHarga;
                stats[index].totalTransaksi += 1;
            }
            
            res.status(200).json({
                error: false,
                message: 'success',
                data: stats
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = TransaksiController;