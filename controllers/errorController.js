const AppError = require("../utils/appError");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
     console.error('ERROR', err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400)
}

const handleDuplicate = err => {
    const message = `Already taken`;
    return new AppError(message, 400)
}

const handleValidation = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Inavalid Input data. ${ errors.join('. ')}`
    return new AppError(message, 400)
}

const handleJWtError = err => new AppError('Invalid Token' , 401);

const handleJWtExpiredError = err => new AppError('Token has Expired',) 
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    if (err.code === 11000) {
      err = handleDuplicate(err)
  }
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "PRODUCTION") {
    let error = { ...err };
    if (error.name ==='CastError') {
        error = handleCastErrorDB(error)
    } 
    if (error.code === 11000) {
        error = handleDuplicate(error)
    }
    if (error.name === 'ValidationError') error = handleValidation(error);
   
    if (error.name === 'JsonWebTokenError') {
      error = handleJWtError(error);
    }
   
    if (error.name === 'TokenExpiredError') {
      error = handleJWtExpiredError(error);
    }
    sendErrorProd(err, res);
  }
};
