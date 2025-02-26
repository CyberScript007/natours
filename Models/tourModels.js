const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModels');

const TourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minLength: [10, 'A tour name must greater or equal to 10'],
      maxLength: [40, 'A tour name must not greater than 40'],
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'The ratings must not be less than 1'],
      max: [5, 'The ratings must not be greater than 5'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      require: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          console.log(val);
          return val < this.price;
        },
        message:
          'Price discount must ({VALUE}) not be greater than the actual price',
      },
    },
    difficulty: {
      type: String,
      require: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Difficulty fields should only consist of easy, medium and difficult',
      },
    },
    duration: {
      type: Number,
      require: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      require: [true, 'A tour must have a max group size'],
    },
    summary: {
      type: String,
      require: [true, 'A tour must have a summary'],
    },
    imageCover: {
      type: String,
      require: [true, 'A tour must have an image cover'],
    },
    images: [String],
    startDates: [Date],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    description: String,
    secret: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],
      description: String,
      address: String,
    },
    locations: [
      {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: [Number],
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// indexes
TourSchema.index({ slug: 1 });
TourSchema.index({ price: 1, ratingsAverage: -1 });
TourSchema.index({ startLocation: '2dsphere' });

// virtual properties
TourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});

// document middleware
TourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// query middleware
TourSchema.pre(/^find/, function (next) {
  this.find({ secret: { $ne: true } });
  next();
});

TourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });

  next();
});

// virtual referencing
TourSchema.virtual('review', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Embedding tour guides
// TourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);

//   next();
// });

// aggregation middleware
// TourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secret: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model('Tour', TourSchema);

module.exports = Tour;
