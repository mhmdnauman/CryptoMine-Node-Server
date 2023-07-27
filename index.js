const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const stripe = require('stripe')('sk_test_51NWcItEb0h9mTy06U7yxZveIAL2bJngqvfGaLmJWydsWV36LdfhqFHOH854Jl1tsj5gSQap7S0qblqauKbEgPnvU00901ohZDr');

app.use(express.json())
app.use(cors());

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
    publishableKey: 'pk_test_51NWcItEb0h9mTy06LrQLmSB2WFVduj5j5XdeBZ5rZl83MLOhx4cml1p4Ycn8a4N1EOSKMeHEWt9udV8uqomUV4M8008YuM4dM1',
    amount: amount
  });


});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});