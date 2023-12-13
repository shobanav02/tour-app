const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({mergeParams : true });

router
  .route('/')
  .get(authController.protect , reviewController.getAllReviews)
  .post(authController.protect , reviewController.createReview);

  router
  .route('/:id')
  // .get(reviewController.getTour)
  // .patch(reviewController.updateTour)
  .delete(authController.protect ,authController.restricTo('admin' ,'lead-guide') ,reviewController.deleteTour);
module.exports = router;

