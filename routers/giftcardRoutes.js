const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth')

const {
  createGiftcards,
  readGiftcards,
  transferGiftcards,
  scanGiftcards,
} = require('../controllers/giftCardRoutesHandlers')

router
  .route('/account/giftcards')
  .post(auth, createGiftcards)
  .get(auth, readGiftcards)

router
  .route('/account/giftcards/transfer/:id')
  .post(auth, transferGiftcards)

module.exports = router