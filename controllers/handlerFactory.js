const catchAsync = require('./../utils/createAsync');
const AppError = require('./../utils/appError');

exports.deleteOne = Model => catchAsync(async (req, res , next) => {
    const record = await Model.findByIdAndDelete(req.params.id);
    if (!record) {
      return next(new AppError('Id does not exists', 404));
    }
    res.status(200).json({
      status: "success",
      message: "succesfully deleted",
      data: null
    });
});

exports.updateOne = Model => catchAsync(async (req, res , next) => {
    const record = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!record) {
      return next(new AppError('Id does not exists', 404));
    }
    res.status(200).json({
      status: "success",
      message: "succesfully update",
      data: {
        record,
      },
    });
});

