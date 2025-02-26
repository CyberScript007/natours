const express = require('express');
const userController = require('./../Controller/userController');
const authController = require('./../Controller/authController');

const routes = express.Router();

routes.post('/signup', authController.signup);
routes.post('/login', authController.login);
routes.get('/logout', authController.logout);
routes.post('/forgotPassword', authController.forgotPassword);
routes.post('/resetPassword/:token', authController.resetPassword);

routes.use(authController.protectedRoute);

routes.get('/me', userController.getMe, userController.getUser);
routes.patch('/updateUserPassword', authController.updateMyPassword);
routes.patch(
  '/updateMe',
  userController.uploadFileUser,
  userController.resizeUploadUserFile,
  userController.updateMe,
);
routes.patch('/deleteMe', userController.deleteMe);

routes.use(authController.restrictUnauthorizedUser('admin'));

routes
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

routes
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = routes;
