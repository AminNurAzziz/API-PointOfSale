const User = require('../models/user-schema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserController {
    static async registerUser(req, res) {
        try {
            const { email, username, nama, role, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 12); // The number 12 here is the salt rounds
    
            let user = await User.findOne({ username });
            if (user) {
                return res.status(400).json({ error: 'Username already exists' });
            }
    
            user = new User({ email, username, nama, role, password: hashedPassword });
            await user.save();
    
            res.status(201).json({
                error: false,
                message: 'Registration successful'
            });
        } catch (err) {
            res.status(500).json({
                error: true,
                message: 'Error registering new user'
            });
        }
    }

    static async loginUser(req, res, next) {
        let user = await User.findOne({ 
            $or: [
                { email: req.body.email },
                { username: req.body.username }
            ] 
        });

        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return res.status(401).json({ error: 'Authentication failed' });
        }

        const secretKey = process.env.SECRET_KEY;
        const payload = {
            userId: user._id,
            username: user.username,
            role: user.role,
        };

        const options = { expiresIn: '1h' };
        const token = jwt.sign(payload, secretKey, options);

        res.cookie('accessToken', token, {
            maxAge: 3600000, // Waktu kedaluwarsa dalam milidetik (1 jam dalam contoh ini)
            httpOnly: true, // Token hanya dapat diakses melalui HTTP dan tidak dari JavaScript
        });

        const loginResult = {
            userId: user._id,
            name: user.username,
            token: token,
        };

        res.status(200).json({
            error: false,
            message: 'success',
            loginResult: loginResult,
        });
    }
    static async logoutUser(req, res, next) {
        if(!req.cookies.accessToken) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Hapus cookie 'accessToken' dengan mengatur waktu kedaluwarsa ke masa lalu
        res.clearCookie('accessToken');

        res.status(200).json({
            error: false,
            message: 'Logout successful',
        });
    }
    
}
module.exports = UserController;



// TODO: USE PASSPORT LOCAL & JWT
// ---------------------------------

// const User = require('../models/userSchema');
// const jwt = require('jsonwebtoken');

// class UserController {

//     static async registerUser(req, res, next) {
//         try {
//             const { email, username, nama, role, password } = req.body;
//             const user = new User({ email, username, nama, role });
//             const registeredUser = await User.register(user, password);
//             req.login(registeredUser, err => {
//                 if (err) return next(err);
//                 res.status(201).json({
//                     error: false,
//                     message: 'success'
//                 });
//             });
//         }
//         catch (err) {
//             next(err);
//         }
//     }
//     static async loginUser(req, res, next) {
//         const redirectUrl = req.session.returnTo || '/';
//         delete req.session.returnTo;
    
//         const token = req.token; // Dapatkan token dari middleware sebelumnya
        
//         if (!token) {
//             return res.status(401).json({
//                 error: true,
//                 message: 'Otentikasi gagal',
//                 loginResult: null,
//             });
//         }
    
//         const decodedToken = jwt.decode(token); // Mendecode token JWT

    
//         if (!decodedToken) {
//             return res.status(401).json({
//                 error: true,
//                 message: 'Token tidak valid',
//                 loginResult: null,
//             });
//         }
    
//         const loginResult = {
//             userId: decodedToken.userId,
//             name: decodedToken.username, // Gantilah dengan properti yang sesuai dengan token Anda
//             token: token,
//         };
    
//         res.status(200).json({
//             error: false,
//             message: 'success',
//             loginResult: loginResult,
//         });
    
//         console.log('Login berhasil');
//     }
    


// }

// module.exports = UserController;