var express = require('express');
var router = express.Router();
var Cart = require('../model/cart');
var Product = require('../model/product')

/* GET users listing. */
router.get('/', function(req, res, next) {
  if (req.query.id) {
    Product.findById(req.query.id, function(error, product) {
      
      if (error) {
        res.locals.error = req.app.get('env') === 'development' ? error : {};
        res.render('error', { page: ' | Product', message: 'Product not found'})
      } else if (product == null) {
        res.locals.error = req.app.get('env') === 'development' ? {} : {};
        res.render('error', { page: ' | Product', message: 'Product not found'})
      }
      else {
        res.render('product', { page: ' | Product', product })
      }
    })
  } else {
    res.locals.error = req.app.get('env') === 'development' ? {} : {};
    res.render('error', { page: ' | Product', message: 'You entered the wrong url'})
  }

});


router.post('/addToCart', function(req, res){
  const {size, id, qty, pictures, price, name } = req.body;
  // console.log({size, id, qty, pictures, price, name});

  const product =   {
    id: id,
    price: Number(price),
    pictures,
    name: name
  };
  // console.log(typeof qty);
  
  var cart = new Cart(req.session.cart || {})
  cart.addProduct(product, size, qty)

  
  req.session.cart = cart;

  res.send('done')
})


router.get('/search', function(req, res){
    var q = req.query.q;
  
      Product.find({ $text: { $search: q }}).exec(function(err, result){
        if (err) {
          res.status(404).send('')
        } else{
          res.send({ result })
        }
      })
      // Product.find({ name: q}, function(err, result){
      //   if (err) {
      //     res.status(404).send('')
      //   } else{
      //     res.send({ result })
      //   }
      // })
})

module.exports = router;