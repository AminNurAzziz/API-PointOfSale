const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const app = express();

const port = process.env.PORT || 3000;
const url = process.env.DB_CONNECTION;
mongoose.connect(url, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
})
.then(() => {
    console.log('Mongo Connection Open');
})
.catch(err => {
    console.log('Mongo Connection Error');
    console.log(err);
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());

// Routes
const produkRoute = require('./routes/produk-route');
const TransaksiRoute = require('./routes/transaksi-route');
const userRoute = require('./routes/user-route');
const pendapatanRoute = require('./routes/pendapatan-route');

app.use('/', produkRoute);
app.use('/', TransaksiRoute);
app.use('/', userRoute);
app.use('/', pendapatanRoute);

// Listen Port
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
