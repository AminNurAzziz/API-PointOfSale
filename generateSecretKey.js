// const crypto = require('crypto');
// const argon2 = require('argon2');
// async function generateSecretKey(user) {
//     const input = user._id + user.username + user.role;
//     const salt = crypto.randomBytes(32); // Buat salt acak
//     const secretKey = await argon2.hash(input, { salt });
    
//     return secretKey;
// }

// module.exports = generateSecretKey;