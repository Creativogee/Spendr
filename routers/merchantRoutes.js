const express = require('express');
const router = new express.Router();
const auth = require('../middleware/merchantAuth');

const {
  createMerchant,
  loginMerchant,
  logoutMerchant,
  getMerchantProfile,
  updateMerchantProfile,
  deleteMerchant,
} = require('../controllers/merchantRoutesHandlers')

const {
  uploadProfilePicture,
  readProfilePicture,
  deleteProfilePicture
} = require('../controllers/userRoutesHandlers')

router.route('/merchants').post(createMerchant);

// router.route('/merchant/login').post(loginMerchant);

// router.route('/merchant/logout').post(auth, logoutMerchant)

// router
//   .route('/merchant/account')
//   .get(auth, getMerchantProfile)
//   .patch(auth, updateMerchantProfile)
//   .delete(auth, deleteMerchant)

//   router
//   .route('/merchant/account/avatar')
//   .post( auth, uploadProfilePicture)
//   .get(auth, readProfilePicture)
//   .delete(auth, deleteProfilePicture)

module.exports = router;