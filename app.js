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

//TODO : WITHOUT JWT
// const express = require('express');
// const mongoose = require('mongoose');
// const path = require('path');
// const methodOverride = require('method-override')
// const passport = require('passport');
// const LocalStrategy = require('passport-local');
// const session = require('express-session');

// const app = express();


// const port = 3000;
// const url = `mongodb://127.0.0.1:27017/POS-System`;
// mongoose.connect(url, {
//     serverSelectionTimeoutMS: 5000, // Add this line
// })
//     .then(() => {
//         console.log('Mongo Connection Open');
//     })
//     .catch(err => {
//         console.log('Mongo Connection Error');
//         console.log(err);
//     });

//     // app.set('views', path.join(__dirname, 'views'));

//     // Middleware
//     app.use(express.json());
//     app.use(express.urlencoded({ extended: true }));
//     app.use(methodOverride('_method'));
//     // app.use(express.static(path.join(__dirname, '/public')));

//     const sessionConfig = {
//         secret: 'thisshouldbeabettersecret',
//         resave: false,
//         saveUninitialized: true,
//         cookie: {
//             httpOnly: true,
//             expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
//             maxAge: 1000 * 60 * 60 * 24 * 7
//         }
//     }
//     app.use(session(sessionConfig));
//     app.use(passport.initialize());
//     app.use(passport.session());

//     const User = require('./models/userSchema');

//     passport.use(new LocalStrategy(User.authenticate()));
//     passport.serializeUser(User.serializeUser());
//     passport.deserializeUser(User.deserializeUser());

//     // Routes
//     const produkRoute = require('./routes/produkRoute');
//     const TransaksiRoute = require('./routes/transaksiRoute');
//     const userRoute = require('./routes/userRoute');

//     app.use('/', produkRoute);
//     app.use('/', TransaksiRoute);
//     app.use('/', userRoute);

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });
