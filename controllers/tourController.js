const Tour = require("../models/tourModel");
const APIFeatures = require( '../utils/apiFeatures');
const AppError = require("../utils/appError");
const catchAsync = require('../utils/createAsync');
const factory = require('./handlerFactory');
// const tours =  JSON.parse(
//     fs.readFileSync('./dev-data/data/tours-simple.json')
// );

// exports.checkId = (req, res, next , val) => {
//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status :'fail',
//             message:'Invalid Id'
//         });
//     }

//     next();
// }

// exports.checkbody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: "fail",
//       message: "missing name or price",
//     });
//   }
// };

exports.topTour = (req , res , next) => {
   req.query.limit = 5

   next();
}

exports.getAllTours = catchAsync(async (req, res , next) => {
    const features = new APIFeatures(Tour.find() , req.query)
      .filter()
      .sorting()
      .limitFields()
      .paginate();
    const tours = await features.query;

    res.status(200).json({
      result: tours.length,
      status: "Success",
      message: "Tours data get successfully",
      data: {
        tours,
      },
    });
  
});

exports.getTour = catchAsync(async (req, res , next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');
    if (!tour) {
      return next(new AppError('Id does not exists', 404));
    }
    res.status(200).json({
      status: "Success",
      message: "Tours data get successfully",
      data: {
        tour,
      },
    });
});

exports.createTour = catchAsync(async (req, res , next) => {

    //one way
    //     const newTour = new Tour ( {
    //         name:req.name,
    //         rating: req.rating,
    //         price : req.price
    //    });
    //    tesTour.save();

    //second way
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: "Success",
      message: "Tours data added successfully",
      data: {
        newTour,
      },
    });
});

exports.updateTour = catchAsync(async (req, res , next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tour) {
      return next(new AppError('Id does not exists', 404));
    }
    res.status(200).json({
      status: "success",
      message: "succesfully update",
      data: {
        tour,
      },
    });
});
//using Factory 
exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res , next) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);
//     if (!tour) {
//       return next(new AppError('Id does not exists', 404));
//     }
//     res.status(200).json({
//       status: "success",
//       message: "succesfully deleted",
//       data: {
//         tour,
//       },
//     });
// });


exports.getTourStats = catchAsync(async (req, res , next) => {
     const stats = await Tour.aggregate([
       {
        $match: { ratingsAverage : { $gte : 4.5} }
       },
       {
          $group: {
           _id: '$difficulty',
           numTours: { $sum: 1},
           numRatings : {$sum : '$ratingsQuantity'},
           avgRating : { $avg : '$ratingsAverage'},
           avgPrice : { $avg : '$price'},
           minPrice : { $min : '$price'},
           maxPrice : { $max : '$price'}
          }
        },
        {
          $sort: {avgPrice :-1 }
        }
        
     ]);

     res.status(200).json({
      status: "success",
      message: "succesfully loaded",
      data: {
        stats
      },
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res , next) => {
     const year = req.params.year *1 ;
     const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte:  new Date(`${year}-01-01`),
            $lte:  new Date(`${year}-12-31`)
          }
        }
      },
      {
         $group: {
          _id: { $month: '$startDates'},
          numTourStarts : { $sum: 1},
          tours: { $push: '$name' }
         }
      },
      {
        $addFields : { month :'$_id'}
      },
      {
        $project : {
           _id: 0
        }
      }
     ]);
     res.status(200).json({
      status: "success",
      message: "succesfully loaded",
      data: {
        plan
      },
    });
});