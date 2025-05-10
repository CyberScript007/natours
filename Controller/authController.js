const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const AppError = require('../Utils/AppError');
const User = require('./../Models/userModels');
const catchAsync = require('./../Utils/catchAsync');
const Email = require('./../Utils/email');

const getToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SCERET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const createTokenFunc = (user, statusCode, res) => {
  const token = getToken(user._id);

  // send the token via cookies
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
  });

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  new Email(newUser, url).sendWelcome();

  createTokenFunc(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if the user provide email or password
  if (!email || !password) {
    return next(new AppError('Please provide your email or password', 400));
  }

  // use the email to find the user in the database
  const user = await User.findOne({ email }).select('+password');

  // check if the user exist && also check if the password is correct
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(
      new AppError(
        'The email or password provide does not correct, Please provide a valid email or password',
        401,
      ),
    );
  }

  createTokenFunc(user, 200, res);
});

exports.protectedRoute = catchAsync(async (req, res, next) => {
  // check is the token is in the headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in, Please log in to get access', 401),
    );
  }

  // verify the token when the user login
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SCERET_KEY,
  );

  // check if the user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exists',
        401,
      ),
    );
  }

  // check if user changed password after the token was issued
  if (currentUser.verifyUserPasswordDate(decoded.iat)) {
    return next(
      new AppError(
        'The user has change is password, sign in with your current password',
        401,
      ),
    );
  }

  // grant the user access
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// only use for rendering page
exports.isLoggedIn = async (req, res, next) => {
  // check is the token is in the headers
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;

    if (!token) {
      return next();
    }

    // verify the token when the user login
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SCERET_KEY,
    );

    // check if the user still exists
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return next();
    }

    // check if user changed password after the token was issued
    if (currentUser.verifyUserPasswordDate(decoded.iat)) {
      return next();
    }

    // grant the user access
    res.locals.user = currentUser;
    return next();
  }
  next();
};

exports.logout = (req, res) => {
  res.clearCookie('jwt');

  res.status(200).json({ status: 'success' });
};

exports.restrictUnauthorizedUser = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not authorized to perform this request', 403),
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get the user email to get the user
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }

  // generate the random token
  const token = await user.createPasswordRandomToken();

  const resetPasswordUrl = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${token}`;

  // send the token to the user mail
  new Email(user, resetPasswordUrl).sendResetPassword();

  res.status(200).json({
    status: 'success',
    message: 'Your email has been succefully deliver',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // encypt the token to compare it to the token in the DATABASE
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // use the token to select the current user and the passwordexpiretoken
  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpiresToken: { $gt: Date.now() },
  });

  // if there is no user return an error to the user

  if (!user) {
    return next(new AppError('Invalid token or token has expired', 400));
  }

  // update the user and delete the passwordExpiretoken and passowrdresetToken
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresToken = undefined;
  await user.save();

  createTokenFunc(user, 200, res);
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  // get the current user by the user id
  const user = await User.findById(req.user._id).select('+password');

  // check if the old password the user enter is correct
  const confirmUserPassword = await user.checkPassword(
    req.body.oldPassword,
    user.password,
  );

  if (!confirmUserPassword) {
    return next(new AppError('Please enter your old password', 401));
  }
  // update the user password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createTokenFunc(user, 200, res);
});
