const { json } = require('express');
const Transaksi = require('../models/transaksi-schema');
const Produk = require('../models/produk-schema');
const PendapatanController = require('./pendapatan-controller');
const moment = require('moment'); // Import library moment untuk memformat tanggal

class TransaksiController {
    static async getAllTransaksi(req, res, next) {
        try {
            const { kategoriProduk } = req.query;

            let transaksi = await Transaksi.find({})
                .populate({
                    path: 'idProduk._id',
                    model: 'Produk',
                    select: 'namaProduk hargaProduk gambarProduk kategoriProduk',
                })
                .exec();

            // Filter transaksi yang memiliki setidaknya satu produk
            transaksi = transaksi.filter((t) => t.idProduk.length > 0);

            let totalMakananTerjual = 0;
            let totalMinumanTerjual = 0;
            let totalPendapatan = 0;

            // Memformat tanggal dan waktu untuk setiap transaksi
            const formattedTransaksi = transaksi.map((t) => {
                // Filter produk berdasarkan kategori
                const filteredProduk = t.idProduk.filter((p) => {
                    return !kategoriProduk || p._id.kategoriProduk === kategoriProduk;
                });

                if (filteredProduk.length === 0) {
                    // Jika setelah filter produk hasilnya kosong, maka skip transaksi ini
                    return null;
                }

                // Menghitung total makanan dan minuman terjual
                filteredProduk.forEach((p) => {
                    if (p._id.kategoriProduk === 'Makanan') {
                        totalMakananTerjual += p.jumlahProduk;
                    } else if (p._id.kategoriProduk === 'Minuman') {
                        totalMinumanTerjual += p.jumlahProduk;
                    }
                });

                // Menghitung total pendapatan berdasarkan kategori produk yang difilter
                if (!kategoriProduk || t.idProduk.some(p => p._id.kategoriProduk === kategoriProduk)) {
                    totalPendapatan += t.totalHarga;
                }

                return {
                    jumlahProduk: t.jumlahProduk,
                    totalHarga: t.totalHarga,
                    tanggalTransaksi: moment(t.tanggalTransaksi).format('DD-MM-YYYY'),
                    waktu: moment(t.tanggalTransaksi).format('HH:mm:ss'),
                    idProduk: filteredProduk.map((p) => ({
                        _id: p._id._id.toString(), // Access the _id of the populated Produk
                        namaProduk: p._id.namaProduk,
                        hargaProduk: p._id.hargaProduk,
                        gambarProduk: p._id.gambarProduk,
                        kategoriProduk: p._id.kategoriProduk,
                        jumlahProduk: p.jumlahProduk,
                        subTotalProduk: p.subTotalProduk,
                    })),
                    idKasir: t.idKasir,
                    idAdmin: t.idAdmin,
                };
            })
                .filter((t) => t !== null); // Filter transaksi yang hasilnya null (tidak memiliki produk yang ditampilkan)
                .sort((a, b) => new Date(b.tanggalTransaksi) - new Date(a.tanggalTransaksi)); // Menyortir berdasarkan tanggalTransaksi secara descending

            res.status(200).json({
                error: false,
                message: 'success',
                totalMakananTerjual,
                totalMinumanTerjual,
                totalPendapatan,
                data: formattedTransaksi,
            });
        } catch (err) {
            next(err);
        }
    }
    static async addTransaksi(req, res, next) {
        try {
            const transaksiData = req.body;
            const transaksi = new Transaksi(transaksiData);
            console.log(transaksiData);
            transaksi.totalHarga = 0;
            const listProduk = [];

            // Kurangi stok produk
            for (let i = 0; i < transaksiData.idProduk.length; i++) {
                const produk = await Produk.findById(transaksiData.idProduk[i]._id);

                if (!produk) {
                    return next(new Error('Produk tidak ditemukan'));
                }

                listProduk.push(produk);

                const jumlahProduk = transaksiData.idProduk[i].jumlahProduk;
                produk.stokProduk -= jumlahProduk;
                await produk.save();

                const subTotalProduk = produk.hargaProduk * jumlahProduk;
                transaksi.idProduk[i].subTotalProduk = subTotalProduk; // Corrected this line
                transaksi.totalHarga += subTotalProduk;
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
        try {
            const { id } = req.params;
            const transaksi = await Transaksi.findByIdAndDelete(id);
            const listProduk = [];
            for (let i = 0; i < transaksi.idProduk.length; i++) {
                const produk = await Produk.findById(transaksi.idProduk[i]._id);
                listProduk.push(produk);
                if (!produk) {
                    return next(new Error('Produk tidak ditemukan'));
                }
            }
            PendapatanController.decreasePendapatan(transaksi, listProduk);
            if (!transaksi) {
                return next(new Error('Transaksi tidak ditemukan'));
            }
            res.status(200).json({
                error: false,
                message: 'success',
                data: transaksi
            });
        }
        catch (err) {
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