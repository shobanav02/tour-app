const mongoose = require('mongoose');
const Tour = require ('./../models/tourModel');
const reviewSchema = new mongoose.Schema ( {
   review: {
    type: String,
    required:[true,'Review is required'],
   },
   rating : {
    type: Number,
    min: 1 ,
    max: 5
   },
   createdAt:  {
    type: Date,
    default: Date.now()
   },
   tour : {
     type : mongoose.Schema.ObjectId,
     ref: 'Tour',
     required:[true,'Review must belong to a tour'],
   },
   user : {
    type : mongoose.Schema.ObjectId,
     ref: 'User',
     required:[true,'Review must belong to a user'],
   },
}, {
    toJSON: {virtuals : true},
    toObject: {virtuals : true}
  
  });

  reviewSchema.index( { tour: 1, user:1},{unique: true});
  reviewSchema.pre(/^find/, function(next) {
    this.populate({
      path:'tour',
      select:'name'
    }).populate({
       path:'user',
       select: 'name, email'
    });

    next();
  });

  reviewSchema.statics.calcAvarageRatings = async  function (tourId) {
    const stats= await this.aggregate([
      {
        $match: { tour: tourId}
      },
      {
        $group: {
          _id: '$tour',
          nRatings: { $sum: 1 },
          averageRating : {$avg :'$rating'}
        }
      }
    ]);
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].averageRating
    });
  }
  reviewSchema.post('save', function ()  {

    //this points to current review
    //this.constructor means Review Model
    this.constructor.calcAvarageRatings(this.tour);
    
  });
const Review = mongoose.model('Review', reviewSchema);
module.exports= Review;