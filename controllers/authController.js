const { promisify } = require("util");
const User = require("./../models/userModel");
const catchAsync = require("../utils/createAsync");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const crypto = require('crypto');
const  bcrypt= require('bcrypt');


const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    passwordUpdatedAt: req.body.passwordUpdatedAt,
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: "success",
    token: token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email and password is required", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  const token = signToken(user._id);
  if (process.env.NODE_ENV === 'PRODUCTION') {
    res.cookie('jwt', token , {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES *24 * 60 * 60 * 1000),
      secure: true,
      httpOnly: true
    })
  }
  res.status(200).json({
    status: "sucess",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token = "";
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("You are not logged In, Please login", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token does not exists", 401)
    );
  }
  if (currentUser.changedPassword(decoded.iat)) {
    return next(new AppError("User has changed the password", 401));
  }
  req.user = currentUser;
  next();
});

exports.restricTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have access permission", 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("User doesnot exists", 404));
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword}/${resetToken}`;

  console.log(resetURL)
  const message = `Forgot your password? Submit a request with new password and password confirm
  to : ${resetURL} .\n If you didn't froget your password ignore the email`;
  try {
    await sendEmail({
      email: user.email,
      subject: "password reset token",
      message: message,
    });

    res.status(200).json({
      status: "success",
      message: " Token send to email",
    });
  } catch (err) {
    console.log(err)
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    return next(new AppError("Try again later", 403));
}
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    // get user based on token
     
    const hashedToken = crypto.createHash('sha256')
    .update(req.params.token)
    .digest('hex');

    const user = await User.findOne({passwordResetToken: hashedToken,
    passwordResetExpires : {$gte :Date.now()}
    });

    if(!user) {
      return next(new AppError("User doesnot exists", 404));
    }

    //if token HAS NOT EXPIRED and set the new password

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //update changePasswordAt


    //log the user signnin and send jwt
    const token = signToken(user._id);
    
    if (process.env.NODE_ENV === 'PRODUCTION') {
      res.cookie('jwt', token , {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES *24 * 60 * 60 * 1000),
        secure: true,
        httpOnly: true
      })
    }
    res.status(200).json({
      status: "sucess",
      token,
    });

});

exports.updatePassword = catchAsync(async(req, res, next)  =>{
   
  //get user from colllection
  const user = await User.findById(req.params.id).select("+password");

  if(!user) {
    return next(new AppError("User doesnot exists", 404));
  }
  //check if current password is correct

  const checkPassword = await user.checkPassword(req.body.currentPassword, user.password);
  if (!checkPassword) {
    return next(new AppError("Given current password does not match", 401));
  }


  //if so update the password
 user.password = req.body.newPassword;
 user.passwordConfirm = req.body.confirmNewPassword;
 await user.save();

  // log user sign in and send jwt
  const token = signToken(user._id);
  if (process.env.NODE_ENV === 'PRODUCTION') {
    res.cookie('jwt', token , {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES *24 * 60 * 60 * 1000),
      secure: true,
      httpOnly: true
    })
  }
    res.status(200).json({
      status: "sucess",
      token,
    });
});