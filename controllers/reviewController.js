const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/createAsync');
const AppError = require("./../utils/appError");
const factory = require('./handlerFactory');
exports.getAllReviews = catchAsync(async (req, res, next) => {
    
    let filter = {};
    if(req.params.tourId) filter = { tour: req.params.tourId};
    const Reviews = await Review.find(filter);
  
    res.status(200).json({
      result: Reviews.length,
      status: "Success",
      message: "Review data get successfully",
      data: {
        Reviews,
      },
    });
  });
exports.createReview = catchAsync(async (req, res, next) => {
   
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user._id;

    const review = await Review.create({
      review : req.body.review,
      rating : req.body.rating,
      tour : req.body.tour,
      user : req.body.user
    });
   
    res.status(200).json({
        status: "Success",
        message: "Review created successfully",
        data: {
            review,
        },
    });
})

exports.deleteTour = factory.deleteOne(Review);
