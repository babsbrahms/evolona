var nodemailer = require('nodemailer')

function Mailer (YourOrder, shipping, totaPrice, to, transactionRef, req, res, name, address, state, country, city) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        tls: true,
        auth: {
          user: process.env.mail_user, // generated ethereal user
          pass: process.env.mail_password // generated ethereal password
       }
    });

    // let transporter = nodemailer.createTransport({
    //   host: 'smtp.mail.yahoo.com',
    //   port: 587,
    //   secure: false, // true for 465, false for other ports
    //   auth: {
    //        user: "nastyyinks@yahoo.com", // generated ethereal user
    //        pass: "Trailblazer94"// generated ethereal password
    //   }
    // });

      
    let mail = `
    <div style="width: 95%; margin:auto; background-color: white; border-radius: 10px; padding: 8px; box-shadow: 4px 4px 4px grey; border-width: 2px; border-style:solid; border-color: #e8ecee7c; margin-bottom: 50px;">
    <br>
    <br>
    <br>
    <h1 style="text-align: center;font-weight:bolder; font-size: 50px">Baz</h1>
    <br>
    <h1 style="text-align: center;font-weight:400;">We have recieved your order.</h1>
    <h1 style="text-align: center; font-weight: normal; font-size: 18px;">Thank you for shopping with us at baz.</h1>
    <br>
    <hr>

    <table style="width: 100%;">
        <tr>
            <th><h3>Shipping address</h3></th>
            <th><h3>When ...</h3></th>
        </tr>

        <tr>
            <td>
                <div style="flex: 1; padding-left: 5px">
                    
                    <p style="text-align: center">
                        ${name}
                    </p>
                    <p style="text-align: center">
                        ${address}
                    </p>
                    <p style="text-align: center">
                        ${city}, ${state}, ${country}
                    </p>
                </div>
            </td>

            <td>
                <div style="flex: 1; padding-left: 5px">      
     
                    <p style="text-align: center">Orders made on or before Thursday will be delivered this Saturday</p>

                    <p style="text-align: center">Orders made after Thursday will be delivered next Saturday</p>

                    <p style="text-align: center">You will be contacted on Friday on how to get your order</p>
                </div>
            </td>
        </tr>
    </table>


    <hr>
    <h3 style="text-align: center;">What you ordered</h3>
    <h4 style="text-align: center;">Transaction number: ${transactionRef}</h4>
    <br/>
    <table style="width: 100%; border-collapse: collapse;">
        <tr>
            <th>product</th>
            <th>size</th>
            <th>qty</th>
            <th>price</th>
        </tr>
        ${YourOrder}
    
    </table>
    <table style="width: 100%;">
        <tr>
            <td colspan="4">
                <th style="padding-top: 10px;">
                    Sub Total: NGN ${totaPrice}
                </th>
            </td>
        </tr>

        <tr>

            <td colspan="4">
                <th style="padding-top: 10px;">
                    Shipping: NGN ${shipping}
                </th>
            </td>
        </tr>

        <tr>
            <td colspan="4">
                <th style="padding-top: 10px;">
                    Total: NGN ${totaPrice + shipping}
                </th>
            </td>
        </tr>
    </table>
    <br>
    <hr>

    <br/>
    <p style="text-align:center;">For any complaint, enquiries or request, contact us at bazonlineshop@gmail.com or any of our contact below the page. </p>

    <p style="text-align:center;"> Make sure to include your transaction number when contacting us.</p>

    <hr>
    <div style="text-align:center;">
        <a href="https://www.instagram.com/baz.ng/?hl=en">
            
                <small class="text-md">Instagram</small>
        </a>
    </div>
    <br>
    <div style="text-align:center;">
        <a href="https://twitter.com/Baz_online?lang=en">
            
                <small class="text-md">Twitter</small>
        </a>
    </div>
    <br>
    <div style="text-align:center;">
        <a href="mailto:bazonlineshop@gmail.com" target="_blank">
            
                <small class="text-md">bazonlineshop@gmail.com</small>
        </a>
    </div>
    <br>
    <div style="text-align:center;">
        <a href="tel:09036994176" target="_blank">
            <small>call 09036994176</small>
        </i></a>
    </div>
    <br>
    <br>
    <br>

</div>
    `;
    
    
    // setup email data with unicode symbols
    let mailOptions = {
        from: `"Baz" <${process.env.email}>`, // sender address
        to: `${to}`, // list of receivers
        subject: 'Notification of your order', // Subject line
        text: 'Hello world?', // plain text body
        html: mail // html body
    };
    
    
      // send mail with defined transport object
     transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
         var ms = req.app.get('env') === 'development' ? error.message : 'Your order has been recieved. We delivery on Saturday and Friday. Thank you for shopping at baz.'
        res.status(401).send({ msg: ms , success: false })
       }else{
         console.log('Message sent: %s', info.messageId);
         req.session.cart = undefined; //clear the cart
         res.status(200).send({ msg: 'Your order is saved. We delivery on Saturday and Friday. Thank you for shopping at baz.', success: true })  
         
       }
     });
}

module.exports = Mailer;




