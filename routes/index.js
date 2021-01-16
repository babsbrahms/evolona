var express = require('express');
var bcrypt = require('bcrypt');

var router = express.Router();
const { check, validationResult } = require('express-validator');

var User = require('../model/user');
var Order = require("../model/order")
var Product = require("../model/product");


router.get('/', function(req, res, next) {
  
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

// route for admin signup
router.get('/signup', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    req.flash('msg', 'You are already logged in')
    res.redirect('/account')
  } else {
    res.render('signup', { page: '| Sign Up', msg: req.flash('msg'), errors: req.flash('errors')})
  }
})

router.post('/signup', 
  [check('email', 'Email is required').notEmpty(),
  check('password', 'Password is requird').notEmpty()], 
  (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('errors', errors.array() )

    return res.redirect(req.get('referer'))
  }

  const user = new User()
  var salt = bcrypt.genSaltSync(10);

//   User.countDocuments((err, count) => {
//     if (err) {
//       res.locals.error = req.app.get('env') === 'development' ? err : {};
    
//       return res.render('error', { page: 'Error' });
//     } else if (count > 1) {
//       req.flash('errors', [{ msg: 'You are not authorized to create an account!!!'}] )

//       return res.redirect('/signup');

//     } else {
      var hash = bcrypt.hashSync(password, salt);
      user.email = email;
      user.password = hash;
      user.save()
      .then(user => {
          console.log('USER:', user);
          console.log('VALUE: ', user.dataValues);
          
          req.flash('msg', 'User Created')
          req.session.user = user;
          res.redirect('/account');
      })
      .catch(error => {
          
          req.flash('errors', [{ msg: error.message }] )
          res.redirect(req.get('referer'));
      });
//     }
//   })
})


// route for user Login
router.get('/login', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    req.flash('msg', 'You are already logged in')
    res.redirect('/account')
  } else {
    res.render('login', { page: '| Login', msg: req.flash('msg'), errors: req.flash('errors')})
  }
})


router.post('/login', 
  [check('email', 'Email is required').notEmpty(), check('password','Password is required').notEmpty()],
  (req, res) => {
  const {email, password} = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash('errors', errors.array() )

    return res.redirect('/login')
  }

  User.findOne({ email }).then(function (user) {
    if (!user) {
        req.flash('errors', [{ msg: 'User not found. Enter valid credentials.'}] )
        res.redirect('/login');
    } else if (!bcrypt.compareSync(password, user.password)) {
        req.flash('errors', [{ msg: 'Incorrect password'}] )
        res.redirect('/login');
    } else {
        console.log('USER:', user);
        console.log('VALUE: ', user.dataValues);
        req.flash('msg', 'Login successfull')
        req.session.user = user;
        res.redirect('/account');
    }
  });
})

// route for user logout
router.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        req.flash('msg', "Logout successful")
        res.clearCookie('user_sid');
        req.session.user = null;
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

router.use(loggedIn)

router.get('/account', function(req, res, next) {
    const {nav} = req.query;
  
    let user = req.session.user;
    
    let current = req.session.cms_number || 0;
    if (nav === 'previous' && (current !== 0) ) {
      current = cms - 1;
    } else if (nav === 'next') {
      current = current + 1;
    } 
  
    req.session.cms_number = current;
    let limit = 10;
    let skip = limit*current;

    Order.find({ email: user.email }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(function (err, orders) {
        if (err) {
            res.locals.error = req.app.get('env') === 'development' ? err : {};
    
            res.render('error', { page: 'CMS' });
        } else if ((orders.length === 0) && (current !== 0)) {
            let count = (current > 0)? current - 1 : 0
            req.session.cms_number = count;
            res.redirect(`/cms`)
        } else {
            res.render('account', { page: '| Account', orders, msg: req.flash('msg'), errors: req.flash('errors'), current_number: current, limit  })
        }
    })
});



router.get("/order/:id", (req, res) => {
  var id = req.params.id
  // console.log(id);

  Order.findOne({ _id: id}, function(err, product) {
      
      if (err) {
          res.locals.error = req.app.get('env') === 'development' ? err : {};
          res.render('error', { page: ' | CMS', message: 'Order not found'})
      } else if (product == null) {
          res.locals.error = req.app.get('env') === 'development' ? {} : {};
          res.render('error', { page: ' | Order', message: 'Order not found'})
      }else {
          
          res.render('my-order', { page: '| Order', orders })
      }
  }) 
})

function loggedIn (req, res, next) {
    if (req.session.user) {
        
        next()

    } else {
        req.flash('errors', "Login is required")
        res.redirect('/login');
    }
}


module.exports = router;
