const mongoose = require('mongoose');
const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema( {   
    name:  {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: [true,'Name already exists'],
        trim: true,
        maxLength: [40, 'A tour name must have less or equal 40 characters'],
        minLength: [10, 'A tour name must have greater or equal 10 characters'],
        //validate: [ validator.isAlpha ,'Tour name should contains characters']
    },
    duration: {
      type: Number,
      required:[ true, 'A tour must have a duration']
    },
    maxGroupSize : {
       type: Number,
       required : [ true , 'A tour must have a group size']
    },
    difficulty : {
      type: String,
      required: [ true, 'A tour must have a dificulty'],
      enum : {
        values: ['easy','medium','difficult'],
        messsage: 'It can be esy or medium or difficulty'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1 , ' A tour must have greater or equla 1'],
      max: [5 , ' A tour must have less or equla 5']

    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
       type: Number,
       required: [ true ,'A tour must have a price']
    },
    priceDiscount : {
      type :Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        messsage :`Discount price ({VALUE})should be below regular price`
      }
    },
    summary : {
      type : String,
      trim: true,
      required : [ true ,' Atour must have a description']
    },
    description : {
      type: String,
      trim: true
    },
    imageCover : {
      type : String,
      required : [ true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    slug: String,
    startLocation : {
      //geoJson
      type: {
          type : String,
          default: 'Point',
          enum : ['Point']
      },
      coordinates : [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type : String,
          default: 'Point',
          enum : ['Point']
        },
        coordinates : [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type : mongoose.Schema.ObjectId,
        ref:'User'
      }
    ],
}, {
  toJSON: {virtuals : true},
  toObject: {virtuals : true}

});
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField:'_id'
});

// tourSchema.pre('save', function(next) {
//    this.slug = slugify(this.name, { lower: true});
//    next();
// });

// tourSchema.pre('save', async function(next) {
//   const guides =this.guides.map( async id => await user.findById(id) ); // return promises
//   this.guides= await Promise.all(guides);
//   next();
// });
//query middleware
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path:'guides',
    select:'-__v -passwordUpdatedAt'
  });
  next();
});

const Tour = mongoose.model('Tour' , tourSchema);

module.exports = Tour;