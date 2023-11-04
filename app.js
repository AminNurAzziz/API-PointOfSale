const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
require('dotenv').config();
const cookieParser = require('cookie-parser');



const app = express();

const port = 3000;
const url = `mongodb://127.0.0.1:27017/POS-System`;
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
const produkRoute = require('./routes/produkRoute');
const TransaksiRoute = require('./routes/transaksiRoute');
const userRoute = require('./routes/userRoute');

app.use('/', produkRoute);
app.use('/', TransaksiRoute);
app.use('/', userRoute);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
