const mongoose = require('mongoose')
const otpGen = require('otp-generator')
const bcrypt = require('bcryptjs')
const { sendOTP } = require('../emails/account')
const Giftcard = require('../models/giftcardModel')
const User = require('../models/userModel')


// @desc    Create a giftcard
// @route   POST /api/users/account/giftcards
// @access  Private
exports.createGiftcards = async (req, res, next) => {

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
exports.readGiftcards = async (req, res, next) => {
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
// @route   POST /api/users/account/giftcards/transfer/-?trf=recv
// @route   POST /api/users/account/giftcards/transfer/:id/?trf=send
// @access  Private
exports.transferGiftcards = async (req, res, next) => {
  try {
    //Recive request
    if(req.query.trf === 'recv') {
      const user = await User.findById(req.user._id)
      if(!req.body.otp) {
        const otp = otpGen.generate(6)
        req.user.otp = otp
        await req.user.save()
        return res.json({succes: true, message: 'A One-Time-Password (OTP) has been sent to you'})
      }

      const address = await user.generateAddress(req)

      if(address) {
        return res.json({ success: true, address })
      }
    }
    //Send request
    if(req.query.trf === 'send') {

      const isMatch = await bcrypt.compare(req.body.password, req.user.password);

      if (!isMatch) {
        throw new Error('Incorrect password');
      }

      const reciever = await User.findOne({username: req.body.username})

      if(!reciever) {
        throw new Error('User not found')
      }

      const addressMatch = reciever.addresses.find((item) => {
        return item.address === req.body.address
      })

      if(!addressMatch) {
        throw new Error('Invalid address. Please confirm address')
      }

      const giftcard = await Giftcard.findOne({
        _id: req.params.id,
        authorId: req.user._id
      })

      if(!giftcard) {
        throw new Error('Giftcard does not exist')
      }

      giftcard.holder = mongoose.Types.ObjectId(reciever._id)
      await giftcard.save()

      res.json({
        success: true,
        message: 'Giftcard transfer successful',
        giftcard
      })
    }

  } catch (e) {
    if(e.name === 'Error') {
      return res.status(400).json({success: false, error: e.message})
    }

    res.status(500).json({success: false, error: e.message})
  }
}
