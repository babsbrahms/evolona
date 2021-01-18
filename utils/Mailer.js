var nodemailer = require('nodemailer')

function Mailer (YourOrder, shipping, totaPrice, to, transactionRef, req, res, name, address, state, country, city) {
    // let transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     tls: true,
    //     auth: {
    //       user: process.env.mail_user, // generated ethereal user
    //       pass: process.env.mail_password // generated ethereal password
    //    }
    // });

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
    <h1 style="text-align: center;font-weight:400;">We have recieved your order.</h1>
    <h1 style="text-align: center; font-weight: normal; font-size: 18px;">Thank you for shopping with us at Evolona.</h1>
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
     
                    <p style="text-align: center">Orders are delivered between 1 - 2 business days.</p>
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
                    Sub Total: USD ${totaPrice}
                </th>
            </td>
        </tr>

        <tr>

            <td colspan="4">
                <th style="padding-top: 10px;">
                    Shipping: USD ${shipping}
                </th>
            </td>
        </tr>

        <tr>
            <td colspan="4">
                <th style="padding-top: 10px;">
                    Total: USD ${totaPrice + shipping}
                </th>
            </td>
        </tr>
    </table>
    <br>
    <hr>

    <br/>
    <p style="text-align:center;">For any complaint, enquiries or request, contact us at evolonacompanyltd@gmail.com or any of our contact below the page. </p>

    <p style="text-align:center;"> Make sure to include your transaction number when contacting us.</p>

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
        subject: 'Order Confirmation', // Subject line
        text: 'Hello world?', // plain text body
        html: mail // html body
    };
    
    
      // send mail with defined transport object
     transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
         var ms = req.app.get('env') === 'development' ? error.message : 'Your order has been recieved. Your order will be delivered within 1 - 2 business day. Thank you for shopping at Evolona.'
        res.status(401).send({ msg: ms , success: false })
       }else{
         console.log('Message sent: %s', info.messageId);
         req.session.cart = undefined; //clear the cart
         res.status(200).send({ msg: 'Your order is saved. Your order will be delivered within 1 - 2 business day. Thank you for shopping at Evolona.', success: true })  
         
       }
     });
}

module.exports = Mailer;




