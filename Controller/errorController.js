const AppError = require('./../Utils/AppError');

const handleInvalidIDDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 404);
};

const handleDuplicateFieldsDB = (err) => {
  const extractString = err.errmsg.match(/name: \"(.*?)\"/)[1];

  const message = `This name "${extractString}" has been used, please use another`;

  return new AppError(message, 404);
};

const handleValidatiorErrDB = (err) => {
  const message = Object.entries(err.errors)
    .map(([field, err]) => `${field}: ${err.message}`)
    .join('. ');

  return new AppError(message, 404);
};

const handleInvalidSignature = () => {
  return new AppError('Verification failed, Please log in', 401);
};

const handleTokenExpired = () => {
  return new AppError('The user token has expired, Please log in again', 401);
};

const sendErrDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  res.status(err.statusCode).render('error', {
    message: err.message,
  });
};

const sendErrProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    return res.status(500).json({
      status: 'error',
      stack: err.stack,
      err: err,
      message: 'Something went wrong 💥💥💥',
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      message: err.message,
    });
  }

  res.status(err.statusCode).render('error', {
    message: '💥💥💥 Something went wrong!',
  });
};

const errorFunc = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, req, res);
  }

  if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleInvalidIDDB(err);

    if (err?.errorResponse?.code === 11000) err = handleDuplicateFieldsDB(err);

    if (err.name === 'ValidationError') err = handleValidatiorErrDB(err);

    if (err.name === 'JsonWebTokenError') err = handleInvalidSignature();

    if (err.name === 'TokenExpiredError') err = handleTokenExpired();

    sendErrProd(err, req, res);
  }
};

module.exports = errorFunc;
