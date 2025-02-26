const express = require('express');
const viewController = require('../Controller/viewController');
const authController = require('../Controller/authController');

const router = express.Router();

router.get(
  '/me',
  authController.protectedRoute,
  viewController.getUserSettings,
);
router.post(
  '/submit-user-setting',
  authController.protectedRoute,
  viewController.updateUserSettings,
);

router.use(authController.isLoggedIn);
router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getToursDetails);
router.get('/login', viewController.getLoginForm);

module.exports = router;
