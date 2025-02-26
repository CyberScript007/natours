const cryto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'Please provide your username'],
  },
  email: {
    type: String,
    require: [true, 'Please provide your email address'],
    validate: [validator.isEmail, 'Please Provide a valid email address'],
    unique: true,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'user', 'lead-guide', 'guide'],
      message:
        'The role field should contain admin, user, lead-guide and guide',
    },
    default: 'user',
  },
  password: {
    type: String,
    require: [true, 'Please provide your password'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    require: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'The password you provided does not match',
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpiresToken: Date,
  isActive: {
    type: Boolean,
    select: false,
    default: true,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangeAt = Date.now() - 1000;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });

  next();
});

// check if the user password is equal to the database password
userSchema.methods.checkPassword = async function (
  userPassword,
  databasePassword,
) {
  return await bcrypt.compare(userPassword, databasePassword);
};

// check if when the password was created === when the token was issued
userSchema.methods.verifyUserPasswordDate = function (JWTIssuedDate) {
  if (this.passwordChangeAt) {
    const passwordChangeAt = this.passwordChangeAt.getTime() / 1000;
    return JWTIssuedDate < passwordChangeAt;
    // 100 200
  }

  return false;
};

userSchema.methods.createPasswordRandomToken = async function () {
  const resetToken = cryto.randomBytes(32).toString('hex');

  this.passwordResetToken = cryto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpiresToken = Date.now() + 10 * 60 * 1000;

  await this.save();

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
