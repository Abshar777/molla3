const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('express-flash');
const bycrypt = require('bcrypt');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const nocach=require('nocache')
const morgan=require('morgan')
require('dotenv').config();
const app = express();
const fs=require('fs')
const mongodbConnect=require('./config/mongodbConnect')

mongodbConnect();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({secret: "heleloooooooo",resave: false,saveUninitialized: true}))
app.use(nocach())
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', userRouter);
app.use('/admin',adminRouter)
app.listen(3000, () => { console.log('in 3000') })

app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error for debugging purposes

    // Redirect to a specific route
    res.redirect('/404');
});

app.get('*',(req,res)=>{
    res.redirect('/404')
})

module.exports = app;
