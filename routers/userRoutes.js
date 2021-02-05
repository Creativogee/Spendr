const express = require('express');
const router = new express.Router();
const auth = require('../middleware/userAuth');

const {
  createUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  uploadProfilePicture,
  readProfilePicture,
  deleteProfilePicture
} = require('../controllers/userRoutesHandlers');

router.route('/users').post(createUser);

router.route('/users/login').post(loginUser);

router.route('/users/logout').post(auth, logoutUser);

router
  .route('/users/account')
  .get(auth, getUserProfile)
  .patch(auth, updateUserProfile)
  .delete(auth, deleteUser);

router
  .route('/users/account/avatar')
  .post( auth, uploadProfilePicture)
  .get(auth, readProfilePicture)
  .delete(auth, deleteProfilePicture)

module.exports = router;
