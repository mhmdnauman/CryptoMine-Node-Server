const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const stripe = require('stripe')('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');
const nodemailer = require('nodemailer');


app.use(express.json())
app.use(cors());

const emailTransporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email service
  auth: {
    user: 'cryptomine.app@gmail.com', // Your email address
    pass: 'wxuxjqvrmpeorlyw', // Your email password or an app-specific password
  },
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/send-otp', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const otp = generateOTP();

  const mailOptions = {
    from: 'cryptomine.app@gmail.com', // Sender email address
    to: email,
    subject: 'Account Recovery OTP',
    text: `Your OTP for account recovery is: ${otp}`,
  };

  emailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'An error occurred while sending the email' });
    }

    console.log('Email sent:', info.response);
    return res.json({ OTP: otp });
  });
});


app.post('/payment-sheet', async (req, res) => {
    

  let amount = 0;  
  
  //following conditions check for the selected package from body of the request and set the ammount


  //99 means 0.99 USD, 199 means 1.99 USD and all of them like that

  if(req.body.package==1){
    amount= 99;
  }
  else if(req.body.package==2){
    amount= 199;
  }
  else if(req.body.package==3){
    amount= 399;
  }
  else if(req.body.package==4){
    amount= 499;
  }

  //generates ephemeralKey

  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: '2022-11-15'}
  );


  //creates payment intent which includes currency, customer Id and ammount

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'USD',
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  //returns the generated keys

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: 'pk_live_51NfNW0KJOfFiDXilSGHUdsWMNIaqrjuLBMj3IrpSDxNvFcWNzYCrsZlxjEX3LBUlGq6dVa1ZdWIOy6SnPxJ1xZ2S00tw53JJ3V',
    amount: amount
  });


});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});