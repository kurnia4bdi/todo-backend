const db = require('../connection/db.js');

module.exports = function (req, res, next) {
    let username = req.headers.username;
    let password = req.headers.password;

    let sql = `SELECT * FROM users WHERE username= ? AND password= ?`;
    db.query(sql, [username, password], function (error, results, fields) {
        if (error) throw error;
        if (results.length > 0) {
            next();
        } else {
            res.sendStatus(401);
        }
    });
};
