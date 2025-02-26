const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../Models/tourModels');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/catchAsync');
const factory = require('../Controller/factory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'The file you upload is not an image, Please upload an image',
        400,
      ),
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.images || !req.files.imageCover) next();

  //  imagecover
  const ext = req.files.imageCover[0].mimetype.split('/')[1];

  req.body.imageCover = `tour-${req.user.id}-${Date.now()}.${ext}`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({
      quality: 90,
    })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // tour images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const ext = file.mimetype.split('/')[1];

      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.${ext}`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    }),
  );
  console.log(req.body.images);
  next();
});

exports.topCheapTours = async (req, res, next) => {
  req.query.sort = '-price,ratingsAverage';
  req.query.limit = '5';
  req.query.fields = 'name,duration,maxGroupSize,difficulty,price';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'review' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// Aggregation pipeline
exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  console.log(req.params);
  const year = Number(req.params.year);

  const monthPlan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourMonth: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        month: -1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      monthPlan,
    },
  });
});

// /distance/:distance/center/:latlng/unit/:unit
// /distance/300/center/40,30/unit/:mi
// geopastial aggregation
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963 : distance / 6378;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide the latitude and longitude data, Please also write it in this format (lat, lng)',
        400,
      ),
    );
  }

  const geo = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[Number(lng), Number(lat)], radius],
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: geo.length,
    data: {
      data: geo,
    },
  });
});

exports.getToursDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371192 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide the latitude and longitude data, Please also write it in this format (lat, lng)',
        400,
      ),
    );
  }

  const tours = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [Number(lng), Number(lat)],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
