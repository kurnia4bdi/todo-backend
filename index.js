const express = require('express'),
cors = require('cors'),
app = express(),
auth = require('./middleware/auth.js'),
db = require('./connection/db.js')

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({
    extended: true
  }));

var server = {
    port : 3080
}

app.get('/', (req,res) => {
    res.send(`
    <html>
        <body>
            <form action="/todo" method="post">
            <input name="deskripsi" />
            <button> Add </button>
            </form>
        </body>
    </html>`)
})

app.get('/todo', auth, (req,res) => {
    let sql = `SELECT * FROM todolist`
    db.query(sql, (error,results,fields) => {
        if (error) throw error
        res.send(results);
    })
})

app.post('/todo', auth, (req, res) => {
     let sql = `INSERT INTO todolist(deskripsi) VALUES (?)`
     let values = [
         req.body.deskripsi
     ]
     db.query(sql, values, (error,results,fields) => {
        if (error) throw error
        res.json({id:results.insertId})
      })
})

app.delete('/todo/:id', auth, (req,res) => {
    let sql = `DELETE FROM todolist WHERE id=(?)`
    let values = [
        req.params.id
    ]
    db.query(sql, values, (error,results,fields) => {
        if(error) throw error;
        res.end()
    })
})

app.post('/user' ,(req,res,next)=>{
    let sql = `SELECT COUNT(*) as jumlah_user FROM users`
    db.query(sql, (error,results, fields) => {  
        if(error) throw error;
        if (results[0].jumlah_user > 0 ) {
            auth(req,res, next)
        }else{
            next()
        }
    })
},  (req,res) => {  
    let sql = `INSERT INTO users(username,password) VALUES (?)`
    let values = [
        req.body.username,
        req.body.password
    ]
    if (req.body.username.length && req.body.password.length === 0) res.end(500)
    db.query(sql, [values], (error,results, fields) => {  
        if(error) throw error;
        res.json({id:results.insertId})
    })
})

app.get('/user', auth, (req,res) => { 
    let sql = `SELECT * FROM users`
    db.query(sql, (error,results,fields) => {
        if (error) throw error
        res.send(results)
    })
 })

 app.delete('/user/:id', auth ,(req,res,next)=>{
    let sql = `SELECT COUNT(*) as jumlah_user FROM users`
    db.query(sql, (error,results, fields) => {  
        if(error) throw error;
        if (results[0].jumlah_user <= 1 ) {            
            res.sendStatus(403)
        }else{
            next()
        }
    })
}, (req,res) => {
     let sql = `DELETE FROM users WHERE id=(?)`
     let values = [
         req.params.id
     ]


     db.query(sql, values, (error, results, fields) => { 
         if (error) throw error
         res.json({pesan:"terhapus"})
      })
   })

app.listen(server.port, () => console.log(`Server started, listening port: ${server.port}`))