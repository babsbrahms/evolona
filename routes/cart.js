var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var Cart = require('../model/cart');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('cart', { page: ' | Shopping cart' })
});

router.get('/clear_cart', function(req, res) {
  var cart = new Cart(req.session.cart || {})
  cart.clearCart()
  
  req.session.cart = cart;
  res.send('done')
})


router.get('/update_cart', function(req, res) {
  const {size, id, qty } = req.query;
  
  var cart = new Cart(req.session.cart || {})
  cart.updateCart(id, size, qty)
  
  req.session.cart = cart;
  res.send('done')
})

router.delete('/delete_cart', function(req, res){
  const {size, id } = req.query;

  var cart = new Cart(req.session.cart || {})
  cart.deleteProduct(id,size)

  req.session.cart = cart;

      
  res.send('done')
})

router.get('/exit_cart', function(req, res) {
  res.redirect('/checkout')
  //res.redirect('/checkout')
})

module.exports = router;

