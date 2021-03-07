var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var Cart = require('../model/cart')
var Order = require('../model/order')
var product = require('../model/product')
var Mailer = require('../utils/Mailer')
var unirest = require('unirest')

var PesaPal = require('pesapaljs').init({
  key: process.env.pesalpal_consumer_key,
  secret: process.env.pesalpal_consumer_secret,
  debug: false // false in production!
});


var csrfProtection = csrf()

router.use(csrfProtection)

/* GET users listing. */
router.get('/', loggedIn, function(req, res, next) {
  res.render('checkout', { page: ' | Checkout', csrfToken: req.csrfToken() })
});


/* GET users listing. */
router.get('/confirmation/:txref', function(req, res, next) {
  var cart = new Cart(req.session.cart || {})
  var txref = req.params.txref
  res.render('confirmation', { page: ' | Confirmation', csrfToken: req.csrfToken(), cart, txref  })
});


// PasalPal IPN
router.get("/pesalpal_listener", PesaPal.paymentListener, function(req, res) { 
  var payment = req.payment;
  // do stuff with payment {transaction, method, status, reference}
  
  // DO NOT res.send()


  //CHECK PAYMENT INFO
  var options = {
    reference: payment.reference, // Send this
    transaction: payment.transaction // or both.
  };
  // PesaPal.getPaymentStatus(options)
  // .then(function(status){ /* do stuff*/ })
  // .catch(function(error){ /* do stuff*/ });

  // PesaPal.getPaymentDetails(options)
  // .then(function (payment) {
  //     //payment -> {transaction, method, status, reference}
  //     //do stuff
  // })
  // .catch(function (error) { /* do stuff*/  });
});


router.get('/payment_callback', function (req, res) {
  var options = { // Assumes pesapal calls back with a transaction id and reference
      transaction: req.query[PesaPal.getQueryKey('transaction')],
      reference: req.query[PesaPal.getQueryKey('reference')]
  };

    PesaPal.getPaymentDetails(options)
    .then(function (payment) {
        // check payment.status and proceed accordingly
        console.log(payment);
        // var message = "Thank you for doing business with us.";
        // res.render("message", {
        //     message: message,
        //     details: JSON.stringify(payment, null, 2)
        // });

        res.send(payment)

    })
    .catch(function(error) {
        // var message = "Oops! Something went wrong";
        // res.render("message", {
        //     message: message,
        //     error: JSON.stringify(error, null, 2)
        // });
        res.send(error)
    });

});


// verify product from chechout
router.post('/verify', (req, res) => {

  if (req.session.cart ==undefined ) {
    
    res.send({ data: 'expired_session'})
  } else {
    var cart = new Cart(req.session.cart || {})

    let {
      first, 
      last, 
      email, 
      country, 
      state, 
      city , 
      address, 
      phone, 
      amount,
      ref
    } = req.body;
    // console.log('one');

    console.log(req.body);
    
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
 
            // var customer = new PesaPal.Customer("kariuki@pesapal.com");
            // var order = new PesaPal.Order("42314123", customer, "Evolona Website Purchase", 1679.50, "USD", "MERCHANT");
            
            // // Redirect user to PesaPal
            // var url = PesaPal.getPaymentURL(order, "http://mysite.co.ke/callback");


            var customer = new PesaPal.Customer(email, phone);
            customer.firstName = first;
            customer.lastName = last;
            customer.address = address;
            customer.city = city;
            customer.state = state;
            var order = new PesaPal.Order(
                ref,
                customer,
                "Evolona Website Purchase",
                amount,
                "USD",
                "MERCHANT"
            );
                
            var paymentURI = PesaPal.getPaymentURL(order, `evolonacompanyltd.com/checkout/confirmation/${ref}`);
            // res.redirect(paymentURI);

            console.log(paymentURI);
            
            req.session.cart = newCart;
            res.send({data: 'done', modify, paymentURI })
        

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

  // var server_url = req.app.get('env') === 'development' ? process.env.server_url_test : process.env.server_url_live;
  //please make sure to change this to production url when you go live

  Order.findOne({ transactionRef: txref }, (orderErr, foundOrder) => {
    if (orderErr) {
      res.status(400).send({ msg: `Your order has been recieved.  All orders are shipped within 1 - 2 business days. Thank you for shopping at Evolona..`, success: false })
    } else if(foundOrder){
      console.log(' found it ');
      
      res.status(400).send({ msg: `Your order has been recieved.  All orders are shipped within 1 - 2 business days. Thank you for shopping at Evolona..`, success: false })
    } else if(!foundOrder){
      console.log('NOT founD ');
          //make a post request to the server
      // unirest.post(server_url)
      // .headers({'Content-Type': 'application/json'})
      // .send(payload)
      // .end(function(response) {
        
      // check status is success.
        PesaPal.getPaymentStatus({ reference: txref })
        .then((status) => { 
          res.send(status)
          // if (response.body.data.status === "successful" &&
          //     response.body.data.chargecode === "00" &&
          //     response.body.data.currency === "USD" &&
          //     response.body.data.amount === ( Number(cart.total_price) + Number(shipping)) ) {
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
                      status: 'ordered',
                      
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
                              <td style="text-align: center; padding: 7px; margin-bottom: 4px; background-color:#f7f7f7; border-collapse: collapse;">${prod.name}</td>
                              <td style="text-align: center; padding: 7px; margin-bottom: 4px; background-color:#f7f7f7; border-collapse: collapse;">${prod.size}</td>
                              <td style="text-align: center; padding: 7px; margin-bottom: 4px; background-color:#f7f7f7; border-collapse: collapse;">${prod.qty} unit</td>
                              <td style="text-align: center; padding: 7px; margin-bottom: 4px; background-color:#f7f7f7; border-collapse: collapse;">USD ${prod.price * prod.qty}</td>
                            </tr>
                              `
                        });
                        
                        
                        product.bulkWrite(productUpdate, function(err, writes) {
                          if (err) {
                            res.status(200).send({ msg: 'Your order is saved. We delivery on Saturday and Friday. Thank you for shopping at Evolona.', success: true }) 
                          } else {
                            //res.status(403).send({ msg: 'Your order is not saved', success: false }) 
                            Mailer(YourOrder, shipping, cart.total_price, email, txref, req, res, name, address, state, country, city)
                          }
                          
                        });
                    }).catch(() => {
                      res.status(400).send({ msg: `Unable to save your order. please send us a picture of your order using the provided email address or phone number. Also add provide your transaction reference number: ${txref}. Thank you for shoppng at Evolona.`, success: false })
                    })
                
          // }else{
          //   res.status(404).send({ msg: 'Problem verifing your payment. contact us using information at the bottom of the page.'})
          // }   
          
        })
        .catch((error) => { 
          res.send(error)
          // res.status(404).send({ msg: 'Problem verifing your payment. contact us using information at the bottom of the page.'})

        });
      // });

    }
  })
})

function loggedIn (req, res, next) {
  if (req.session.user) {
      next()

  } else {
        //     console.log("path: ", req.path);
        // console.log("URL: ", req.originalUrl)
    req.session.login_redirect = req.originalUrl
    req.flash('errors', [{ msg: "Login is required" }] )
    res.redirect('/login');
  }
}

module.exports = router;