const User = require("../models/userModel");
const APIFeatures = require( '../utils/apiFeatures');
const AppError = require("../utils/appError");
const catchAsync = require('../utils/createAsync');


const filterObj = (obj , ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach ( el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
}
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const Users = await User.find();

  res.status(200).json({
    result: Users.length,
    status: "Success",
    message: "Users data get successfully",
    data: {
      Users,
    },
  });
});
  exports.createUser = (req, res) => {
    res.status(500).json({
      status:'error',
      message:"This route is not implemented"
    })
  }
  exports.getUser = catchAsync(async (req, res, next) => {
    const Users = await User.find();

    res.status(200).json({
      result: Users.length,
      status: "Success",
      message: "Users data get successfully",
      data: {
        Users,
      },
    });
  
  });
  exports.updateUser = (req, res) => {
    res.status(500).json({
      status:'error',
      message:"This route is not implemented"
    })
  
  }
  exports.deleteUser = catchAsync (async(req, res, next) => {
    
    await User.findByIdAndUpdate(req.params.id, { active: false});

    res.status(200).json({
      status:'success',
      message:"User deleted succuesfully",
      data : null
    })
  });

  exports.updateMe = catchAsync (async(req, res , next) => {
    
    // create error if user post password
    if (req.body.password || req.body.passwordConfirm) {
       return next( new AppError('You cannot update password here') , 400);
    }

    // filter body data (should contain email and name)
    const filter = filterObj(req.body , 'name' ,'email');
    //update user
    const user= await User.findByIdAndUpdate(req.params.id, filter, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status:'success',
      message:"User updated",
      data : {
        user
      }
    })
  
  });