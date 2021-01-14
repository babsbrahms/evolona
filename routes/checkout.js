var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var Cart = require('../model/cart')
var Order = require('../model/order')
var product = require('../model/product')
var Mailer = require('../utils/Mailer')
var unirest = require('unirest')

var csrfProtection = csrf()

router.use(csrfProtection)

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('checkout', { page: ' | Checkout', csrfToken: req.csrfToken() })
});


/* GET users listing. */
router.get('/confirmation/:txref', function(req, res, next) {
  var cart = new Cart(req.session.cart || {})
  var txref = req.params.txref
  res.render('confirmation', { page: ' | Confirmation', csrfToken: req.csrfToken(), cart, txref  })
});



// verify product from chechout
router.get('/verify', (req, res) => {

  if (req.session.cart ==undefined ) {
    
    res.send({ data: 'expired_session'})
  } else {
    var cart = new Cart(req.session.cart || {})

    // console.log('one');
    
    // verify
    var ids = []
    cart.products.forEach((product) => {
      ids.push(product.id)
    })
    // console.log('two');
    // fetch product with the ids
    product.find({ _id: { $in: ids }}).exec(function(err, products) {
      if (err) {
        req.session.cart = { products: [], totalPrice: 0, total_qty: 0}
        res.send('error')
      } else {

        // console.log('three');
        
         // remake cart
          var newCart = {};
          newCart.products = [];
          newCart.total_qty = 0;
          newCart.total_price = 0;

          var modify = false;

            cart.products.forEach((p, index) => {
              var product = products.find(x => x._id == p.id)
              
              if (product) {
                var pIndex = product.sizes.find(x => (x.size === p.size) && (x.qty > 0));
                // console.log('Pindex', pIndex);
                
                  // check if (size.size === '' ) & (size.qty > 0) & (p.id ==id)
                  if (pIndex && pIndex.qty >= 0) {
                    var cont = {};
                    cont.price =  product.price;
                    cont.qty = p.qty >= pIndex.qty? pIndex.qty : p.qty;
                    cont.name = product.name;
                    cont.id = product._id;
                    cont.size = p.size;
                    cont.product = product;
                    
                   
                    
                    newCart.products.push(cont);
                    newCart.total_qty += cont.qty;
                    newCart.total_price += (cont.qty * cont.price)

                    if ((cont.qty != p.qty) || (cont.price != p.price) ) {
                      modify = true
                    }
                  } else {
                    modify = true
                  }
              } else {
                modify = true
              }
            });
 
            // console.log('four');
            // console.log(newCart);
            
            req.session.cart = newCart;
            res.send({data: 'done', modify })
        

      }
    })
  }
})



// order product from chechout
router.post('/order', (req, res) => {
  const {txref, name, email, address, city, state,country, phone, shipping, cart} = req.body;
  
  //verify tranction
  var payload ={
    "SECKEY": req.app.get('env') === 'development' ? process.env.rave_secret_test :process.env.rave_secret_live,
    "txref": txref 
  };

  var server_url = req.app.get('env') === 'development' ? process.env.server_url_test : process.env.server_url_live;
  //please make sure to change this to production url when you go live

  Order.findOne({ transactionRef: txref }, (orderErr, foundOrder) => {
    if (orderErr) {
      res.status(400).send({ msg: `Your order has been recieved.  All orders are shipped within 3-5 working days. Thank you for shopping at BAZ..`, success: false })
    } else if(foundOrder){
      console.log(' found it ');
      
      res.status(400).send({ msg: `Your order has been recieved.  All orders are shipped within 3-5 working days. Thank you for shopping at BAZ..`, success: false })
    } else if(!foundOrder){
      console.log('NOT founD ');
          //make a post request to the server
      unirest.post(server_url)
      .headers({'Content-Type': 'application/json'})
      .send(payload)
      .end(function(response) {
        
       // check status is success.
          if (response.body.data.status === "successful" &&
              response.body.data.chargecode === "00" &&
              response.body.data.currency === "NGN" &&
              response.body.data.amount === ( Number(cart.total_price) + Number(shipping)) ) {
                // console.log('Success CHARGE');
                  
                    // order
                    Order.create({
                      cart,
                      name,
                      email,
                      phone,
                      shipping,
                      totalPrice:( Number(cart.total_price) + Number(shipping)),
                      transactionRef: txref,
                      address: {
                        address,
                        city,
                        state,
                        country
                      },
                      date: new Date(),
                      status: 'ordered'
                    })
                    .then(() => {
                        // send Mail
                        var YourOrder = ''  
                        var productUpdate = [];
                        cart.products.forEach((prod) => {
                            productUpdate.push({
                              updateOne: {
                                "filter" : { _id: prod.id, "sizes.size": prod.size },
                                "update" : { $inc: { "sizes.$.qty": -prod.qty }}
                              }
                            });
 
                            YourOrder += ` 
                            <tr>
                              <td style="text-align: center; padding: 7px; margin-bottom: 4px; background-color:rgb(229, 243, 166); border-collapse: collapse;">${prod.name}</td>
                              <td style="text-align: center; padding: 7px; margin-bottom: 4px; background-color:rgb(229, 243, 166); border-collapse: collapse;">${prod.size}</td>
                              <td style="text-align: center; padding: 7px; margin-bottom: 4px; background-color:rgb(229, 243, 166); border-collapse: collapse;">${prod.qty} unit</td>
                              <td style="text-align: center; padding: 7px; margin-bottom: 4px; background-color:rgb(229, 243, 166); border-collapse: collapse;">NGN ${prod.price * prod.qty}</td>
                            </tr>
                              `
                        });
                        
                        
                        product.bulkWrite(productUpdate, function(err, writes) {
                          if (err) {
                            res.status(200).send({ msg: 'Your order is saved. We delivery on Saturday and Friday. Thank you for shopping at baz.', success: true }) 
                          } else {
                            //res.status(403).send({ msg: 'Your order is not saved', success: false }) 
                            Mailer(YourOrder, shipping, cart.total_price, email, txref, req, res, name, address, state, country, city)
                          }
                          
                        });
                    }).catch(() => {
                      res.status(400).send({ msg: `Unable to save your order. please send us a picture of your order using the provided email address or phone number. Also add provide your transaction reference number: ${txref}. Thank you for shoppng at baz.`, success: false })
                    })
                
          }else{
            res.status(404).send({ msg: 'Problem verifing your payment. contact us using information at the bottom of the page.'})
          }          
      });

    }
  })
})

module.exports = router;