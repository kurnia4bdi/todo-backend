const express = require('express'),
    cors = require('cors'),
    app = express(),
    db = require('./connection/db.js'),
    auth = require('./middleware/auth.js');

let serverku = {
    port: 3080,
};

app.use(express.json());
app.use(cors());
app.use(
    express.urlencoded({
        extended: true,
    })
);

const http = require('http').createServer(app);

let server = http.listen(serverku.port, () =>
    console.log(`Server started, listening port: ${serverku.port}`)
);

const io = require('socket.io')(http, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

io.on('connection', (socket) => {
    console.log(socket.id);
    console.log('a user connected');

    socket.on('todo-add', (data) => {
        let sql = `INSERT INTO todolist(deskripsi) VALUES (?)`;
        let values = [data.deskripsi];
        db.query(sql, values, (error, results) => {
            if (error) throw error;
            io.emit('todo-add', {
                data: {
                    insertedID: results.insertId,
                    deskripsi: data.deskripsi,
                },
            });
        });
    });

    socket.on('todo-remove', (data) => {
        let sql = `DELETE FROM todolist WHERE id=(?)`;
        let values = [data];
        db.query(sql, values, function (err) {
            if (err) throw err;
            io.emit('todo-remove', {
                data: {
                    deletedID: data,
                },
            });
        });
    });
});

app.get('/todo', (req, res) => {
    let sql = `SELECT * FROM todolist`;
    db.query(sql, (err, data) => {
        if (err) throw err;
        res.send(data);
    });
});

app.post('/todo', auth, (req, res) => {
    let sql = `INSERT INTO todolist(deskripsi) VALUES (?)`;
    let values = [req.body.deskripsi];
    db.query(sql, values, (error, results, fields) => {
        if (error) throw error;
        res.json({ id: results.insertId });
    });
});

app.delete('/todo/:id', auth, function (req, res) {
    let sql = `DELETE FROM todolist WHERE id=(?)`;
    let values = [req.params.id];
    db.query(sql, [values], function (err) {
        if (err) throw err;
        res.end();
    });
});

app.post(
    '/user',
    (req, res, next) => {
        let sql = `SELECT COUNT(*) as jumlah_user FROM users`;
        db.query(sql, (error, results, fields) => {
            if (error) throw error;
            if (results[0].jumlah_user > 0) {
                auth(req, res, next);
            } else {
                next();
            }
        });
    },
    (req, res) => {
        let sql = `INSERT INTO users(username,password) VALUES (?)`;
        let values = [req.body.username, req.body.password];
        if (req.body.username.length && req.body.password.length === 0)
            res.end(500);
        db.query(sql, [values], (error, results, fields) => {
            if (error) throw error;
            res.json({ id: results.insertId });
        });
    }
);

app.get('/user', auth, (req, res) => {
    let sql = `SELECT * FROM users`;
    db.query(sql, (error, results, fields) => {
        if (error) throw error;
        res.send(results);
    });
});

app.delete(
    '/user/:id',
    auth,
    (req, res, next) => {
        let sql = `SELECT COUNT(*) as jumlah_user FROM users`;
        db.query(sql, (error, results, fields) => {
            if (error) throw error;
            if (results[0].jumlah_user <= 1) {
                res.sendStatus(403);
            } else {
                next();
            }
        });
    },
    (req, res) => {
        let sql = `DELETE FROM users WHERE id=(?)`;
        let values = [req.params.id];

        db.query(sql, values, (error, results, fields) => {
            if (error) throw error;
            res.json({ pesan: 'terhapus' });
        });
    }
);
