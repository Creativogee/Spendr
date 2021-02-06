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

const {
  scanGiftcards
} = require('../controllers/giftcardRoutesHandlers')

router.route('/merchants').post(createMerchant);

router.route('/merchants/login').post(loginMerchant);

router.route('/merchants/logout').post(auth, logoutMerchant)

router
  .route('/merchants/account')
  .get(auth, getMerchantProfile)
  .patch(auth, updateMerchantProfile)
  .delete(auth, deleteMerchant)

  router
  .route('/merchants/account/avatar')
  .post( auth, uploadProfilePicture)
  .get(auth, readProfilePicture)
  .delete(auth, deleteProfilePicture)

router
  .route('/account/giftcards/:id/:spendr')
  .post(auth, scanGiftcards)

module.exports = router;