const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401); // if there isn't any token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // if the token is no longer valid
        req.user = user;
        next(); // proceed to the next middleware or route handler
    });
}

function verifyAdmin(req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.role === 'Administrador') {
            next();
        } else {
            res.status(403).send({ message: 'Require Admin Role!' });
        }
    });
}

module.exports = { verifyToken, verifyAdmin };
