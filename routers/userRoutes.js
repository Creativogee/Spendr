const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');

const {
  createUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
} = require('../controllers/userRoutesHandlers');

router.route('/').post(createUser);

router.route('/login').post(loginUser);

router.route('/logout').post(auth, logoutUser);

router
  .route('/u')
  .get(auth, getUserProfile)
  .patch(auth, updateUserProfile)
  .delete(auth, deleteUser);

module.exports = router;
