const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override')

const app = express();


const port = 3000;
const url = `mongodb://127.0.0.1:27017/POS-System`;
mongoose.connect(url, {
    serverSelectionTimeoutMS: 5000, // Add this line
})
    .then(() => {
        console.log('Mongo Connection Open');
    })
    .catch(err => {
        console.log('Mongo Connection Error');
        console.log(err);
    });

    // app.set('views', path.join(__dirname, 'views'));

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(methodOverride('_method'));
    // app.use(express.static(path.join(__dirname, '/public')));

    // Routes
    const produkRoute = require('./routes/produkRoute');
    const TransaksiRoute = require('./routes/transaksiRoute');
    app.use('/', produkRoute);
    app.use('/', TransaksiRoute);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
