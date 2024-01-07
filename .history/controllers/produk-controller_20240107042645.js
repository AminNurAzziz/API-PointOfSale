const Produk = require('../models/produk-schema');
const Transaksi = require('../models/transaksi-schema');

class ProdukController {
    static async getAllProduk(req, res, next) {
        const params = req.query.kategori;
        const produk = await Produk.find({ kategoriProduk: params });
        res.status(200).json({
            error: false,
            message: 'success',
            data: produk
        });
    }

    static async populerProduk(req, res, next) {
        try {
            const produkTerjual = await Transaksi.aggregate([
                { $unwind: "$idProduk" },
                {
                    $group: {
                        _id: "$idProduk._id",
                        namaProduk: { $first: "$idProduk.namaProduk" },
                        totalTerjual: { $sum: "$idProduk.jumlahProduk" }
                    }
                },
                { $sort: { totalTerjual: -1 } }
            ]);

            res.status(200).json({
                error: false,
                message: 'success',
                data: produkTerjual
            });
        } catch (err) {
            next(err);
        }
    }


    static async addProduk(req, res, next) {
        try {
            const produk = new Produk(req.body);
            await produk.save();
            res.status(201).json({
                error: false,
                message: 'success'
            });
            if (res.status(201)) {
                console.log('Produk berhasil ditambahkan');
            }
        } catch (err) {
            next(err);
        }
    }

    static async getDetailProduk(req, res, next) {
        try {
            const produk = await Produk.findById(req.params.id);
            res.status(200).json({
                error: false,
                message: 'success',
                data: produk
            });
        } catch (err) {
            next(err);
        }
    }

    static async updateProduk(req, res, next) {
        try {
            const { id } = req.params;
            const { ...updateData } = req.body;
            const update = await Produk.findByIdAndUpdate(id, updateData, { new: true });
            if (!update) {
                return next(new Error('Produk tidak ditemukan'));
            }
            res.status(200).json({
                error: false,
                message: 'success',
                data: update
            });
        }
        catch (err) {
            next(err);
        }
    }


    // TODO : will change be soft delete if already fiks
    static async deleteProduk(req, res, next) {
        const id = req.params.id;

        try {
            // Find the product and delete it
            const produk = await Produk.findByIdAndDelete(id);

            if (!produk) {
                return next(new Error('Produk tidak ditemukan'));
            }

            // Delete related documents in the transaksis collection
            await Transaksi.updateMany(
                { "idProduk._id": produk._id },
                { $pull: { idProduk: { _id: produk._id } } }
            );

            res.status(200).json({
                error: false,
                message: 'success'
            });
        } catch (err) {
            next(err);
        }
    }

}

module.exports = ProdukController;