const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRoutes = require('./../routes/reviewRoutes');    

const router = express.Router();

router.use('/:tourId/reviews', reviewRoutes);

//router.param('id', tourController.checkId);
router.param('id',(req,res,next, val)=>{
    console.log(`tour id is : ${val}`);
    next();
})
router
 .route('/tour-stats')
 .get(tourController.getTourStats);
 
router
 .route('/monthly-plan/:year')
 .get(authController.protect ,authController.restricTo('admin' ,'lead-guide','guide'),tourController.getMonthlyPlan);
 
router
 .route('/top-cheap')
 .get(tourController.topTour , tourController.getAllTours);


router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect,authController.restricTo('admin' ,'lead-guide'), tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect ,authController.restricTo('admin' ,'lead-guide'),tourController.updateTour)
  .delete(authController.protect ,authController.restricTo('admin' ,'lead-guide') ,tourController.deleteTour);

module.exports = router;

