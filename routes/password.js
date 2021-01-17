var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var csrf = require('csurf');
var expressValidator = require('express-validator');

var User = require('../model/user')
var getmail = require("../config/getmail")



var csrfProtection = csrf()
router.use(csrfProtection)



//reset password
router.post('/reset/:token', function(req, res, next){
 var token = req.params.token
  //validation
  var password = req.body.password
  req.check('password', "Enter a minimiun of 5 character password").isLength({min: 5});
 
  var errors = req.validationErrors()
  let message =[]
  if(errors){
      
      errors.forEach(error => {
          message.push(error.msg)
      });

      req.flash("wrong_user", message);
      res.redirect(`/password/reset/${token}`)
  }else{
    User.findOne({$and:[{token: token}, {isValid: true}, {email: req.body.email}]}, function(err, user){
      if(err){
        req.flash('wrong_user', "Wrong Email or token has been used")
        res.redirect(`/password/reset/${token}`)
      }
      
      else if(!user){
        req.flash('wrong_user', "Wrong Email or token has been used")
        res.redirect(`/password/reset/${token}`)
      
      } else if(user){
          var hashpassword = user.hashPassword(req.body.password)
          user.password = hashpassword;
          user.isValid = false;
          user.save(function(err, done){
            if(err){
              res.render("error",{message: err.message, error: err})
            }
            
                req.flash('found', "Your password is reset")
                res.redirect('/user/profile');
            
            
          })
      }
      
      
      
    })
  }



})



// reset password
router.get('/reset/:token', function(req, res, next){
  if(req.params.token == undefined || res.status == 401 ){ //unauthorized
   
    res.send('wrong token or token has expired.Try agin <a href="http://localhost:3000/password/forgot">forgot password</a> ')
    
  }else{


    jwt.verify(req.params.token, 'mysecret', function(err, valid){
      if(err){
        
        res.send('wrong token or token has expired.Try agin <a href="http://localhost:3000/password/forgot">forgot password</a> ')
        
      }else{
        
        var token = req.params.token;

        var message = req.flash('wrong_user')
         res.render('password/reset_password',{
           
            csrfToken: req.csrfToken(),
             message: message,
              msg: message.length> 0, 
              token: token})
         
      }
    })
  }
 
})





router.get('/forgot', function(req, res, next){
  res.render('password/forgot_password')
 
})





function sendEmail (io){
  io.on('connection', function(socket){
    
    socket.on('email', function(email){
     


      User.findOne({email: email}, function(err, user){

          if(err){
            io.emit('not_found', 'You don\'t exit in the database. <a href="http://localhost:3000/user/signup">Sign UP</a>')
            console.log(err);

          }
          else if(user == null){
            io.emit('not_found', 'You don\'t exit in the database. <a href="http://localhost:3000/user/signup">Sign UP</a>')
          }
          else if(user){
             var word = 'watch me do my shit'

              jwt.sign( {word}, 'mysecret',{expiresIn: '10m'}, function(err, token){
                if(err){
                  console.log(err)
                  io.emit('error_jwt', err.message)
                }else{
                  

                  let mail = `
                  <h1>Reset your password</h1>
                  <p>We got a request to reset your password from Skinstitution, click the link below to reset your password</p>
                  <a href="http://localhost:3000/password/reset/${token}">reset password</a>
                  <p>this link will expire in 10 mins. tick tock!!</p>

                  <p> if you did not send this mail? <a href="http://localhost:3000/password/forgot">change password</a> </p>
                  `;
                  
                    
                      let transporter = nodemailer.createTransport({
                        host: 'smtp.mail.yahoo.com',
                        port: 587,
                        secure: false, // true for 465, false for other ports
                        auth: {
                            user: getmail.user, // generated ethereal user
                            pass: getmail.pass // generated ethereal password
                        }
                      });
                    
                    // setup email data with unicode symbols
                    let mailOptions = {
                        from: `"Skinstitution" <${getmail.user}>`, // sender address
                        to: `${email}`, // list of receivers
                        subject: 'Reset your password', // Subject line
                        text: 'Hello world?', // plain text body
                        html: mail // html body
                    };
                    // send mail with defined transport object
                        transporter.sendMail(mailOptions, (error, info) => {
                          if (error) {
                            io.emit('error', error.message)
                              return console.log(error);
                              
                          }else{
                            console.log('Message sent: %s', info.messageId);
                        
                            io.emit('email', 'Message sent, check your mail')
                            
                           
                           

                            user.token = token;
                            user.isValid = true;

                            user.save(function(err, saved){
                              if(err){
                                console.log(err)
                              }
                              
                            })

                          }
                        
                        });

                }       
                      
              }) 
         }            
                      
      })

    })

    
        io.on('disconnect', function(){

        })
  })
}




module.exports = {router, sendEmail};