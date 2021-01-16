var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var mongoose = require('mongoose');
var cors = require('cors')
var MemoryStore = require('memorystore')(session)
const MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
require('dotenv').config();


var cartRouter = require('./routes/cart');
var checkoutRouter = require('./routes/checkout');
var productRouter = require('./routes/product');
var cmsRouter = require('./routes/cms');
var index = require("./routes/index")


var app = express();

app.use(cors())

var dbString = app.get('env') === 'development' ? process.env.DBdev : process.env.DB;

mongoose.connect(dbString, { useNewUrlParser: true });
const db = mongoose.connection;

db.on('error', function() {
  console.log('mongodb server down');
})

db.once('open', function() {
  console.log('MONGO CONNECTED'); 
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret:"they_are_here",
  proxy: false,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  // store: new MemoryStore({
  //   checkPeriod: 86400000 // prune expired entries every 24h
  // }),
  // store: new FileStore({}),
  cookie:{
    maxAge: 86400000,
    // secure: true
  }, //how long before session expire in milliseconds (24 hours)
}))

app.use(flash());

// middleware
app.use(function(req, res, next) {
  res.locals.cart = req.session.cart;
  res.locals.auth = req.session.user ? true : false;
  res.locals.user_email = req.session.user? req.session.user.email : ""
  next()
})

app.use(express.static(path.join(__dirname, 'public')));

app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);
app.use('/product', productRouter);
app.use('/cms', cmsRouter);
app.use("/", index)

/* GET home page. */



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { page: ' | Error'});
});
const port = process.env.PORT || 4000
app.listen(port, () => {
   console.log('Server started on %d', port)
})

module.exports = app;
