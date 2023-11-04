const User = require('../models/userSchema');
const bcrypt = require('bcrypt'); // Make sure to install bcrypt to handle password checking
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
            await user.save(); // Save the user with the hashed password
    
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

        const options = { expiresIn: '55s' };
        const token = jwt.sign(payload, secretKey, options);

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
}
module.exports = UserController;



// USE PASSPORT LOCAL & JWT
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