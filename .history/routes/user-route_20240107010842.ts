import express from 'express';
import passport from 'passport';
import { Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user-schema';
import UserController from '../controllers/user-controller';

dotenv.config();

const router: Router = express.Router();

router.route('/register')
    .post(UserController.registerUser);

router.route('/login')
    .post(UserController.loginUser);

router.route('/logout')
    .get(UserController.logoutUser);

export = router;


// TODO without typescript
// const express = require('express');
// const router = express.Router();
// const passport = require('passport');
// const User = require('../models/user-schema');
// const UserController = require('../controllers/user-controller');
// // Auth with JWT
// const bcrypt = require('bcrypt'); // Make sure to install bcrypt to handle password checking
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// router.route('/register')
//     .post(UserController.registerUser);

// router.route('/login')
//     .post(UserController.loginUser)

// router.route('/logout')
//     .get(UserController.logoutUser);

// module.exports = router;






// USE PASSPORT LOCAL & JWT
// ---------------------------------

// const express = require('express');
// const router = express.Router();
// const passport = require('passport');
// const User = require('../models/userSchema');
// const UserController = require('../controllers/userController');
// // Auth with JWT
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// router.route('/register')
//     .post(UserController.registerUser);

//     router.route('/login')
//     .post(async (req, res, next) => {
//         passport.authenticate('local', async (err, user, info) => {
//             if (err) {
//                 // Terjadi kesalahan saat otentikasi
//                 return res.status(500).json({ error: 'Kesalahan server' });
//             }
//             if (!user) {
//                 // Otentikasi gagal
//                 return res.status(401).json({ error: 'Otentikasi gagal' });
//             }
//             // Otentikasi berhasil, Anda dapat melakukan sesuatu di sini jika diperlukan
//             try {
//                 const secretKey = process.env.SECRET_KEY
//                 console.log(secretKey);

//                 const payload = {
//                     userId: user._id,
//                     username: user.username,
//                     role: user.role,
//                 };

//                 const options = {
//                     expiresIn: '55s',
//                 };

//                 const token = jwt.sign(payload, secretKey, options);

//                 req.token = token;
//                 return next();
//             } catch (error) {
//                 console.error('Error generating secretKey:', error);
//                 return res.status(500).json({ error: 'Kesalahan server saat masuk' });
//             }
//         })(req, res, next);
//     }, UserController.loginUser);

// // router.route('/logout')
// //     .get(UserController.logoutUser);

// module.exports = router;
