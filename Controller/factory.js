const ApiFeatures = require('../Utils/ApiFeatures');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/catchAsync');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError('This id is not valid, please use a valid one', 400),
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.files);
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError('This id is not valid, please use a valid one', 400),
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, populatePath) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (populatePath?.path)
      query = Model.findById(req.params.id).populate(populatePath);

    const doc = await query;

    if (!doc) {
      next(new AppError('This id is not valid, please use a valid one', 400));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    let filter = {};

    if (req.params.tourId) filter = { tour: req.params.tourId };

    // query
    const features = new ApiFeatures(req.query, Model.find(filter))
      .filter()
      .sort()
      .selectFields()
      .pagination();

    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
