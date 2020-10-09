require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MySQLStore = require('express-mysql-session')(session);
const { authenticate } = require('./authenticate');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyparser.json());
app.use(cookieParser());
app.use(bodyparser.urlencoded({ extended: true }));

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 100,
    multipleStatements: true
})

var sessionStore=new MySQLStore({
    expiration:600000,
    createDatabaseTable:true,
    schema:{
        session_id:'session_id',
        expires:'expires',
        data:'data'
    }
},connection)

app.use(session({
    key: 'sid',
    secret: 'washie',
    store:sessionStore,
    resave: false,
    saveUninitialized: false,
}));


connection.getConnection((err) => {
    if (err) throw err;
    console.log("connected");
})

app.get(`/`, (req, res) => {
    res.send(
        `<form method="POST" action="/signup">
            <h2>Register</h2>
            <div>
            <label>name</label><br/>
            <input type="text" placeholder="username" name="name" />
            </div>

            <div>
            <label>Username</label><br/>
            <input type="text" placeholder="username" name="user" />
            </div>

            <div>
            <label>Password</label><br/>
            <input type="password" placeholder="password" name="password" />
            </div>
            
            <div>
            <input type="submit" value="sign up"/><br/>
            <a href="/login">login</a>
             </div>
        </form>`
    )
})

app.get(`/login`, (req, res) => {
    res.send(`<div><h2>contact</h2>
    <a href="/">home</a>
    <form method="POST" action="/login">
        <input type="text" placeholder="username" name="user" />
        <input type="password" placeholder="password" name="pass" />
        <input type="submit" value="login"/>
    </form>
    </div>`)
})


app.post(`/login`, (req, res) => {
    if (req.body.user === '' || req.body.pass === '') {
        res.send(`<h1>Please make sure you fill the all the fields correctly</h1>
        <a href="/login">back</a>`)
        res.redirect(`/login`)
    } else {
        if (req.body.user === 'washie' && req.body.pass === '12345') {
            req.session.user = req.body.user;
            res.send(`<h1 style="color:green;">Login successful</h1>
            <div><a href="/secure">proceed to secure page</a>
            </div>`);

        } else {
            req.session.user = null;
            res.send('<h2>invalid login details</h2> <a href="/login">login</a>');
        }
    }
});

app.get(`/logout`, (req, res) => {
    req.session.destroy(() => {
        console.log(`logout successful`);
    })
    res.redirect(`/login`)
})

app.get(`/secure`, authenticate, (req, res) => {
    res.send(`<h2>Welcome to a secure page</h2>
    <div><a href="/logout">logout</a></div>`);
})

app.get(`*`,authenticate,(req,res)=>{
    res.send(`<h2>Other Requests landing page</h2>`)
})

app.listen(port, () => {
    console.log(`listening to ${port}`);
})