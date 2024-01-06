
const Pendapatan = require('../models/pendapatan-schema');

class PendapatanController {
    static async getAllPendapatan(req, res, next) {
        const pendapatan = await Pendapatan.find({});
        res.status(200).json({
            error: false,
            message: 'success',
            data: pendapatan
        });
    }

    static async addPendapatan(transaksi, listProduk, res) {
        try {
            const tanggalPendapatan = transaksi.tanggalTransaksi.toISOString().split('T')[0];
            let findPendapatan = await Pendapatan.findOne({ tanggalPendapatan });

            if (!findPendapatan) {
                findPendapatan = new Pendapatan();
                findPendapatan.idAdmin = transaksi.idAdmin;
                findPendapatan.totalPendapatan = 0;
                findPendapatan.tanggalPendapatan = tanggalPendapatan;
                findPendapatan.pendapatanMakanan = 0;
                findPendapatan.pendapatanMinuman = 0;

                console.log('Pendapatan Baru berhasil ditambahkan');
            }

            findPendapatan.totalPendapatan += transaksi.totalHarga;

            listProduk.forEach((produk, index) => {
                if (produk.kategoriProduk === 'Makanan') {
                    const totalPendapatanMakanan = produk.hargaProduk * transaksi.idProduk[index].jumlahProduk;
                    findPendapatan.pendapatanMakanan += totalPendapatanMakanan;
                } else if (produk.kategoriProduk === 'Minuman') {
                    const totalPendapatanMinuman = produk.hargaProduk * transaksi.idProduk[index].jumlahProduk;
                    findPendapatan.pendapatanMinuman += totalPendapatanMinuman;
                }
            });
            await findPendapatan.save();
            console.log('Pendapatan Hari ini berhasil ditambahkan');
        } catch (err) {
            console.log(err);
        }
    }

    static async decreasePendapatan(transaksi, listProduk) {
        const pendapatan = await Pendapatan.findOne({ tanggalPendapatan: transaksi.tanggalTransaksi.toISOString().split('T')[0] });
        if (!pendapatan) {
            // return next(new Error('Pendapatan tidak ditemukan'));
            return;
        }
        listProduk.forEach((produk, index) => {
            if (produk.kategoriProduk === 'Makanan') {
                const totalPendapatanMakanan = produk.hargaProduk * transaksi.idProduk[index].jumlahProduk;
                pendapatan.pendapatanMakanan -= totalPendapatanMakanan;
            } else if (produk.kategoriProduk === 'Minuman') {
                const totalPendapatanMinuman = produk.hargaProduk * transaksi.idProduk[index].jumlahProduk;
                pendapatan.pendapatanMinuman -= totalPendapatanMinuman;
            }
        });
        pendapatan.totalPendapatan -= transaksi.totalHarga;
        await pendapatan.save();
        console.log('Pendapatan berhasil dikurangi');
    }

    static async deletePendapatan(req, res, next) {
        const { id } = req.params;
        const pendapatan = await Pendapatan.findByIdAndDelete(id);
        if (!pendapatan) {
            return next(new Error('Pendapatan tidak ditemukan'));
        }
        res.status(200).json({
            error: false,
            message: 'success',
            data: pendapatan
        });
    }

}

module.exports = PendapatanController;