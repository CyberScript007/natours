const express = require('express');
const tourController = require('./../Controller/tourController');
const authController = require('./../Controller/authController');
const reviewController = require('./../Controller/reviewController');
const reviewRouter = require('../routes/reviewRoutes');

const routes = express.Router();

// routes.param('id', tourController.checkID);

routes.use('/:tourId/review', reviewRouter);

routes
  .route('/top-cheap-tours')
  .get(tourController.topCheapTours, tourController.getAllTours);

routes.route('/tours-stat').get(tourController.getTourStats);

// /distance/:distance/center/:latlng/unit/:unit
routes
  .route('/tours-within/distance/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

routes
  .route('/distance/:latlng/unit/:unit')
  .get(tourController.getToursDistances);

routes
  .route('/monthly-plan/:year')
  .get(
    authController.protectedRoute,
    authController.restrictUnauthorizedUser('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

routes
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protectedRoute,
    authController.restrictUnauthorizedUser('admin', 'lead-guide'),
    tourController.createTour,
  );

routes
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protectedRoute,
    authController.restrictUnauthorizedUser('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protectedRoute,
    authController.restrictUnauthorizedUser('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = routes;
