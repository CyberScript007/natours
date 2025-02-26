// import open from 'open';
const Flutterwave = require('flutterwave-node-v3');
const Tour = require('../Models/tourModels');
const catchAsync = require('../Utils/catchAsync');

// initial flutterwave api
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY,
);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // get the current tour with tourId
  const tour = await Tour.findById(req.params.tourId);

  // create a payload object to be able to initialize flutterwave api for payment
  const payload = {
    redirect_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${req.params.tourId}&user=${req.user.id}`,
    tx_ref: req.params.tourId,
    card_number: '5531886652142950',
    cvv: '564',
    expiry_month: '09',
    expiry_year: '26',
    amount: tour.price,
    currency: 'USD',
    email: req.user.email,
    fullname: req.user.name,
    phone_number: '+2348169324063',
    enckey: process.env.FLW_ENCRYPTION_KEY,
  };

  // initialize payment with flutterwave
  const response = await flw.Charge.card(payload);

  // Authorizing transaction
  // 1) PIN transaction
  if (response.meta.authorization.mode === 'pin') {
    let payload2 = payload;
    payload2.authorization = {
      mode: 'pin',
      fields: ['pin'],
      pin: 3310,
    };

    const reCallCharge = await flw.Charge.card(payload2);

    // Add the otp to authorize transaction
    const calValidate = await flw.Charge.validate({
      otp: '12345',
      flw_ref: reCallCharge.data.flw_ref,
    });
  }

  // 2) For 3DS or VBV transactions, redirect users to their issue to authorize the transaction
  if (response.meta.authorization.mode === 'mode') {
    const url = response.meta.authorization.redirect;
    console.log(url);
    response.url = url;
  }

  res.status(200).json({
    status: 'success',
    data: response,
  });
});

exports.getMyBookedTours = (req, res, next) => {
  res.status(200).json({
    status: 'success',
    testing: true,
  });
};
