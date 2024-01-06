const jwt = require('jsonwebtoken');

function checkUserRole(role) {
    return async (req, res, next) => {
        // Skip authentication in development environment
        if (process.env.NODE_ENV === 'development') {
            req.user = { role: 'Admin' }; // You can set a dummy user for development purposes
            console.log('Skip authentication in development environment');
            return next();
        }

        // Retrieve the token from the Authorization header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ error: 'Token tidak ditemukan' });
        }

        const token = authHeader.split(' ')[1]; // Assuming the Authorization header contains "Bearer <token>"
        if (!token) {
            return res.status(401).json({ error: 'Token tidak tersedia' });
        }

        try {
            // Use the secret key from your environment variables
            const secretKey = process.env.SECRET_KEY;
            if (!secretKey) {
                return res.status(500).json({ error: 'Kunci rahasia tidak ditemukan' });
            }

            // Verify the token with the secret key
            const decoded = jwt.verify(token, secretKey);
            console.log(`Ini hasil decoded: ${JSON.stringify(decoded)}`);

            // Check if the decoded token has the required role
            if (decoded.role !== role) {
                return res.status(403).json({ error: 'Akses ditolak' });
            }

            // Save the user info in the request object
            req.user = decoded;
            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            // Catch the error if token is invalid or has expired
            console.error(error);
            return res.status(403).json({ error: 'Token tidak valid atau telah kadaluwarsa' });
        }
    };
}

module.exports = {
    checkAdmin: checkUserRole('Admin'), // Middleware to check for admin role
    checkKasir: checkUserRole('Kasir'), // Middleware to check for cashier role
};
