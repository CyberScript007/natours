const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../Utils/AppError');
const catchAsync = require('../Utils/catchAsync');
const User = require('./../Models/userModels');
const factory = require('../Controller/factory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];

//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('You can only upload an image', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadFileUser = upload.single('photo');

exports.resizeUploadUserFile = async (req, res, next) => {
  if (!req.file) return next();

  const ext = req.file.mimetype.split('/')[1];

  req.file.filename = `user-${req.user.id}-${Date.now()}.${ext}`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpg')
    .jpeg({
      quality: 90,
    })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

const filterPasswordField = (req, ...fields) => {
  const newObj = {};

  Object.keys(req.body).forEach((el) => {
    if (fields.includes(el)) {
      newObj[el] = req.body[el];
    }
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  // check if the user try to update password or passwordConfirm field
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'You are not allowed to updated your password in this url, please use /updateMyPassword to change your password',
      ),
    );
  }

  // filter the password field from what the user input
  const filterObj = filterPasswordField(req, 'email', 'name');

  if (req.file) filterObj.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user._id, filterObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Please make use of /signup to create new user',
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
