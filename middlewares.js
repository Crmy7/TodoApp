const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const sqlQuery = require("./mysql/mysql");

function authentificationMiddleware(req, res, next) {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        const token = req.headers.authorization.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                console.log(err);
                return res.status(401).json({ message: 'Token invalide' });
            }
            const userId = decoded.id;
            sqlQuery(`SELECT id, display_name FROM user WHERE id = ${userId}`, (results) => {
                console.log(results);
                if (results.length === 0) {
                    res.status(400);
                    res.send("Invalid password or email");
                    return;
                }
                const user = results[0];
                req.user = user;
                console.log("UserID:", user);
                next();
            });
        });
    } else {
        res.status(401);
        res.send('Pas connecté');
    }
}


module.exports = {
    authentificationMiddleware: authentificationMiddleware
};
