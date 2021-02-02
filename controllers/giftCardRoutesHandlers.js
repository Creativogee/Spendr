const otpGen = require('otp-generator')
const { sendOTP } = require('../emails/account')
const Giftcard = require('../models/giftcardModel')
const User = require('../models/userModel')


// @desc    Create a giftcard
// @route   POST /api/users/account/giftcards
// @access  Private
exports.createGiftcard = async (req, res, next) => {

  try {
    const giftcard = new Giftcard({...req.body, authorId: req.user._id})

    await giftcard.save()

    return res.status(200).json({
      success: true,
      giftcard
    })
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: e.message
    })
  }

}

// @desc    Read giftcards
// @route   GET /api/users/account/giftcards
// @access  Private
exports.readGiftcard = async (req, res, next) => {
  const match = {};
  const sort = {};

  if (req.query.status) {
    match.status = req.query.status === 'actv'? 'ACTIVE': 'trfd'? 'TRANSFERED': 'rdmd'? 'REDEEMED': false
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');

    sort[parts[0]] = parts[1] === 'desc' ? -1 : 'asc' ? 1: false;
  }

  try {
    await req.user
    .populate({
      path: 'giftcards',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort,
      },
    })
    .execPopulate()

  res.send(req.user.giftcards);

  } catch (e) {
    res.status(500).send(e);
  }
}

// @desc    Recieve giftcards
// @route   POST /api/users/account/giftcards/#/?trf=recv
// @route   POST /api/users/account/giftcards/#/?trf=send
// @access  Private
exports.transferGiftcard = async (req, res, next) => {
  try {
    if(req.query.trf === 'recv') {
      const user = await User.findById(req.user._id)
      const address = await user.generateAddress(req)

      if(address) {
        return res.status(200).json({ success: true, address })
      }
    }

    if(req.query.trf === 'send') {

    }

    res.status(400).send()

  } catch (e) {

    if(e.message == 'Invalid OTP') {
      res.status(400).json({success: false, error: e.message})
    }

    if(e.message == 'A One-Time-Password (OTP) has been sent to your email') {
      const otp = otpGen.generate(6)
      req.user.otp = otp
      await req.user.save()
      // sendOTP(req.user.email, req.user.name, otp)
      res.json({success: true, message: e.message})
    }
    
  }
}

exports.sendGiftcard = async (req, res, next) => {

  try {

  } catch (e) {
    
  }
}
