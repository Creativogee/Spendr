const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const { profilePictureUpload } = require('../files/upload')

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

router.route('/').post(createUser);

router.route('/login').post(loginUser);

router.route('/logout').post(auth, logoutUser);

router
  .route('/account')
  .get(auth, getUserProfile)
  .patch(auth, updateUserProfile)
  .delete(auth, deleteUser);

router
  .route('/account/avatar')
  .post( auth, profilePictureUpload.single('picture'), uploadProfilePicture)
  .get(auth, readProfilePicture)
  .delete(auth, deleteProfilePicture)

module.exports = router;
