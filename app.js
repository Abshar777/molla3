const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('express-flash');
const bycrypt = require('bcrypt');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const nocach=require('nocache')
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

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
