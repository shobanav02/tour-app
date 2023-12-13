const path = require('path');
const express = require('express');
const app = express();
const morgan = require('morgan');
const errorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const hpp = require('hpp');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

//serving static files
app.use(express.static(path.join(__dirname,'public')));

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));


//Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());


// Data sanitization against nosql query injection (example when giving email with gte)
app.use(xss());

//against parameter pollution (duplicate values)
app.use(hpp({
  whitelist:['duration']
}));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Routes
app.get('/' ,(req, res) => {
  res.status(200).render('base', {
    tour: 'The forest',
    user:'Jonas'
  })
})

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
   next(new AppError('Not Found', 404));
});
// error handler middleware
app.use(errorHandler);

module.exports = app;