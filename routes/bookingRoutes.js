const express = require('express');
const authController = require('../Controller/authController');
const bookingController = require('../Controller/bookingController');

const router = express.Router();

router.get(
  '/checkout-session/:tourId',
  authController.protectedRoute,
  bookingController.getCheckoutSession,
);

router.get(
  '/my-tours',
  authController.protectedRoute,
  bookingController.getMyBookedTours,
);

module.exports = router;
