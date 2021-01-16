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
require('dotenv').config();
var cartRouter = require('./routes/cart');
var checkoutRouter = require('./routes/checkout');
var productRouter = require('./routes/product');
var cmsRouter = require('./routes/cms');
var Product = require('./model/product')

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

// middleware
app.use(function(req, res, next) {
  res.locals.cart = req.session.cart;
  next()
})

app.use(express.static(path.join(__dirname, 'public')));

app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);
app.use('/product', productRouter);
app.use('/cms', cmsRouter);

/* GET home page. */
app.get('/', function(req, res, next) {
  
  const {nav} = req.query;
  let current = req.session.blog_number || 0;
  if (nav === 'previous' && (current !== 0) ) {
    current = current - 1;
  } else if (nav === 'next') {
    current = current + 1;
  } 

  req.session.blog_number = current;
  let limit = 10;
  let skip = limit*current;
  Product.find({}).sort({ _id: -1 }).skip(skip).limit(limit).exec(function (err, clothings) {
      if (err) {
        res.locals.error = req.app.get('env') === 'development' ? err||errs : {};

        res.render('/', { page: '', message: err.message});
      } else if ((clothings.length === 0) && (current !== 0)) {
        let count = (current > 0)? current - 1 : 0
        req.session.blog_number = count;
        res.redirect('/')
      } else {
        res.render('index', { page: '', clothings, current_number: current, limit });
      }
  })
});


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
