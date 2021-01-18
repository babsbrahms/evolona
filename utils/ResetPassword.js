var nodemailer = require('nodemailer')

function ResetPassword (req, res, token, to) {

    let transporter = nodemailer.createTransport({
      host: 'smtp-relay.sendinblue.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
            user: "evolonacompanyltd@gmail.com", // generated ethereal user
            pass: "qz0kfPUFKM8yOJms" // generated ethereal password
      }
    });

      
    let mail = `
    <div style="width: 95%; margin:auto; background-color: white; border-radius: 10px; padding: 8px; box-shadow: 4px 4px 4px grey; border-width: 2px; border-style:solid; border-color: #e8ecee7c; margin-bottom: 50px;">
        <br>
        <br>
        <br>
        <h1 style="text-align: center;font-weight:bolder; font-size: 50px">Evolona</h1>
        <br>
        <h1 style="text-align: center;font-weight:400;">Use the token below to reset our password</h1>
        <h1 style="text-align: center; font-weight: normal; font-size: 18px; background-color: f8c46f;">${token}</h1>
        <br>

        <br/>
        <p style="text-align:center;">For any complaint, enquiries or request, contact us at evolonacompanyltd@gmail.com </p>

        <hr>

        <br>
        <div style="text-align:center;">
            <p>
                PLOT 143, NABBINGO, NSANGI, BUSIRO, WAKISO DISTRICT. UGANDA.
            </p>
        </div>
        <br>
        <div style="text-align:center;">
            <a href="mailto:evolonacompanyltd@gmail.com" target="_blank">
                
                    <small class="text-md">evolonacompanyltd@gmail.com</small>
            </a>
        </div>
        <br>
        <br>
        <br>
        <br>

    </div>
    `;
    
    
    // setup email data with unicode symbols
    let mailOptions = {
        from: `"Evolona" <${process.env.email}>`, // sender address
        to: `${to}`, // list of receivers
        subject: 'Reset Password', // Subject line
        html: mail // html body
    };
    
    
      // send mail with defined transport object
     transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
          // var ms = req.app.get('env') === 'development' ? error.message : 'Your order has been recieved. Your order will be delivered within 1 - 2 business day. Thank you for shopping at Evolona.'
          //   res.status(401).send({ msg: ms , success: false })
            req.flash('errors', [{ msg: error.message }] )
            res.redirect('/forgot_password'); 
       }else{
            console.log('Message sent: %s', info.messageId);
            req.flash('msg', 'Please check your email for reset password token!')
            res.redirect('/reset_password');          
       }
     });
}

module.exports = ResetPassword;
