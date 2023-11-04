const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
require('dotenv').config();
// Removed LocalStrategy import because we're now using JWT
// const session = require('express-session'); // Not needed for JWT

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

// app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// app.use(express.static(path.join(__dirname, '/public')));

// JWT Strategy options
const SECRET = process.env.SECRET_KEY; // You should use an environment variable for this
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET
};

// JWT strategy for handling JWT
passport.use(new JwtStrategy(jwtOptions, function(jwt_payload, done) {
    User.findById(jwt_payload.id, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}));

// Removed session and local strategy setup because it's not used with JWT

const User = require('./models/userSchema');

// Removed Local Strategy configuration
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// Initialize Passport
app.use(passport.initialize());
// Removed passport session middleware
// app.use(passport.session());

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
