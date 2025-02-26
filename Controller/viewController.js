const Tour = require('../Models/tourModels');
const User = require('../Models/userModels');
const catchAsync = require('../Utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  //  get all tours
  const tours = await Tour.find();

  // build the overview template by passing the tours as a variable into the render method
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getToursDetails = catchAsync(async (req, res, next) => {
  // get tour by their slug name
  const tour = await Tour.findOne({
    slug: req.params.slug,
  }).populate('review');

  // render the tour using tour template
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  // render the login template
  res.status(200).render('login', {
    title: 'Log in into your account',
  });
});

exports.getUserSettings = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Update your account',
  });
});

exports.updateUserSettings = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, {
    name: req.body.name,
    email: req.body.email,
  });

  res.status(200).render('account', {
    user,
  });
});
