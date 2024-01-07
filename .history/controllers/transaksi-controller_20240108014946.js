const { json } = require('express');
const Transaksi = require('../models/transaksi-schema');
const Produk = require('../models/produk-schema');
const PendapatanController = require('./pendapatan-controller');
const moment = require('moment'); // Import library moment untuk memformat tanggal

class TransaksiController {
    static async getAllTransaksi(req, res, next) {
        try {
            const { kategoriProduk, sort, startDate, endDate } = req.query;

            const start = startDate ? moment(startDate).startOf('day') : moment().startOf('day');
            const end = endDate ? moment(endDate).endOf('day') : moment().endOf('day');

            let transaksi = await Transaksi.find({
                tanggalTransaksi: { $gte: start.toDate(), $lte: end.toDate() }
            })
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
                .filter((t) => t !== null) // Filter transaksi yang hasilnya null (tidak memiliki produk yang ditampilkan)
                .sort((a, b) => new Date(`${b.tanggalTransaksi} ${b.waktu}`) - new Date(`${a.tanggalTransaksi} ${a.waktu}`))
            if (sort === 'asc') {
                formattedTransaksi.sort((a, b) => a.totalHarga - b.totalHarga);
            } else if (sort === 'desc') {
                formattedTransaksi.sort((a, b) => b.totalHarga - a.totalHarga);
            }


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

    static async getHourlyEarnings(req, res, next) {
        try {
            const { startDate, endDate, startHour, endHour } = req.query;

            // Ambil tanggal awal dan akhir dari query params
            const startOfDay = startDate ? moment(startDate).startOf('day').hour(14) : moment().startOf('day').hour(14);
            const endOfDay = endDate ? moment(endDate).endOf('day').hour(2) : moment().endOf('day').hour(2);



            const transaksiToday = await Transaksi.find({
                tanggalTransaksi: {
                    $gte: startOfDay.toDate(),
                    $lte: endOfDay.toDate()
                }
            });

            // Inisialisasi struktur data untuk menyimpan pendapatan per jam
            let hourlyEarnings = Array(24).fill(0);

            // Proses setiap transaksi dan tambahkan ke pendapatan per jam yang sesuai
            for (let trans of transaksiToday) {
                const transTime = moment(trans.tanggalTransaksi);
                const hourIndex = transTime.hour();

                // Filter transaksi berdasarkan jam
                if (hourIndex >= startTime && hourIndex <= endTime) {
                    hourlyEarnings[hourIndex] += trans.totalHarga;
                }
            }

            // Filter out hours with zero earnings and include tanggalTransaksi for each transaction
            const nonZeroHourlyEarnings = hourlyEarnings
                .map((earnings, hour) => ({
                    date: moment(transaksiToday.find(trans => moment(trans.tanggalTransaksi).hour() === hour)?.tanggalTransaksi).format('YYYY-MM-DD'),
                    hour,
                    earnings
                }))
                .filter(item => item.earnings > 0);

            console.log(nonZeroHourlyEarnings);
            // Format data response with date, start hour, end hour, and earnings
            const formattedData = nonZeroHourlyEarnings.map(item => ({
                date: item.date,
                startHour: `${String(item.hour).padStart(2, '0')}:00:00`,
                endHour: `${String(item.hour + 1).padStart(2, '0')}:00:00`,
                earnings: item.earnings
            }));

            res.status(200).json({
                error: false,
                message: 'success',
                data: formattedData
            });
        } catch (err) {
            next(err);
        }
    }


}

module.exports = TransaksiController;