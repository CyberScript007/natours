const express = require('express');
const authController = require('./../Controller/authController');
const reviewController = require('./../Controller/reviewController');

const router = express.Router({ mergeParams: true });

router.use(authController.protectedRoute);

router
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.restrictUnauthorizedUser('user'),
    reviewController.setTourAndUserID,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictUnauthorizedUser('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictUnauthorizedUser('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = router;
