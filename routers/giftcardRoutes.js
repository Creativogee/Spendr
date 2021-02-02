const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth')

const {
  createGiftcard,
  readGiftcard,
  transferGiftcard,
  scanGiftcard,
} = require('../controllers/giftCardRoutesHandlers')

router
  .route('/account/giftcards')
  .post(auth, createGiftcard)
  .get(auth, readGiftcard)

router
  .route('/account/giftcards/transfer')
  .post(auth, transferGiftcard)

module.exports = router