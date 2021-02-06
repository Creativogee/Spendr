const express = require('express');
const router = new express.Router();
const auth = require('../middleware/userAuth')

const {
  createGiftcards,
  readGiftcards,
  transferGiftcards,
  scanGiftcards,
} = require('../controllers/giftcardRoutesHandlers')

router
  .route('/account/giftcards')
  .post(auth, createGiftcards)
  .get(auth, readGiftcards)

router
  .route('/account/giftcards/transfer/:id')
  .post(auth, transferGiftcards)

module.exports = router