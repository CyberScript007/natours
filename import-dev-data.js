const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./Models/tourModels');
const User = require('./Models/userModels');
const Review = require('./Models/reviewModel');

dotenv.config({ path: './config.env' });

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours.json`, 'utf-8'),
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`, 'utf-8'),
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/reviews.json`, 'utf-8'),
);

mongoose
  .connect(
    'mongodb+srv://Ash-Shakur:4Yf2AS04KnLsQaqE@ash-shakur.ek9wu.mongodb.net/natours?retryWrites=true&w=majority',
  )
  .then(() => console.log('DB sucessfully connected!!!'));

const importData = async (req, res) => {
  try {
    const newTours = await Tour.create(tours);
    const user = await User.create(users, { validateBeforeSave: false });
    const review = await Review.create(reviews, { validateBeforeSave: false });

    console.log(user);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  } finally {
    process.exit();
  }
};

const deleteData = async (req, res) => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  } finally {
    process.exit();
  }
};
console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
}

if (process.argv[2] === '--delete') {
  deleteData();
}
