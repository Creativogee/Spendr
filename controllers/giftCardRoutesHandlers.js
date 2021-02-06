const mongoose = require('mongoose')
const otpGen = require('otp-generator')
const bcrypt = require('bcryptjs')
const { sendOTP } = require('../emails/account')
const Giftcard = require('../models/giftcardModel')
const User = require('../models/userModel')
const Merchant = require('../models/merchantModel')


// @desc    Create a giftcard
// @route   POST /api/users/account/giftcards
// @access  Private
exports.createGiftcards = async (req, res, next) => {

  try {
    const giftcard = new Giftcard({...req.body, authorId: req.user._id, holderId: req.user._id})

    await giftcard.save()

    return res.status(200).json({
      success: true,
      id: giftcard._id,
      type: giftcard.type,
      amount: giftcard.amount,
      status: giftcard.status,
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

    const giftcards = req.user.giftcards.map(giftcard => {
      return {
        id: giftcard._id,
        type: giftcard.type,
        amount: giftcard.amount,
        status: giftcard.status,
      }
    })

  res.json({
    giftcards
  })

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
        return res.json({succes: true, message: 'A One-Time-Password (OTP) has been sent to you'})
      }

      const address = await user.generateAddress(req)
      user.addresses = user.addresses.concat({ address })
      user.otp = undefined

      await req.user.save()


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
        holderId: req.user._id
      })

      if(!giftcard) {
        throw new Error('Giftcard does not exist')
      }

      giftcard.holderId = mongoose.Types.ObjectId(reciever._id)
      const transfer = {
        senderId: req.user._id,
        recieverId: reciever._id,
        when: Date.now()
      }

      giftcard.transfers = giftcard.transfers.concat(transfer)
      

      await giftcard.save()

      res.json({
        success: true,
        message: 'Giftcard transfer successful',
        type: giftcard.type,
        amount: giftcard.amount,
        'sent to': reciever.username,
      })
    }

  } catch (e) {
    if(e.name === 'Error') {
      return res.status(400).json({success: false, error: e.message})
    }

    res.status(500).json({success: false, error: e.message})
  }
}

// @desc    Scan giftcards
// @route   POST /api/v1/users/account/giftcards/:id/:spendr
// @access  Private
exports.scanGiftcards = async (req, res, next) => {
  class CustomError extends Error {
    constructor(message) {
      super(message);
      this.name = "customError";
    }
  }
  
  const _id = req.params.id
  const spendr = req.params.spendr
try {
  const merchant = await Merchant.findById(req.user._id)
  const giftcard = await Giftcard.findById(_id)
  const user = await User.findOne({username: spendr})

  if(!giftcard) {
    throw new customError(`Not a valid ${merchant.company} giftcard`)
  }
  
  if(user._id === giftcard.holderId) {
    throw new customError(`Not a valid ${merchant.company} giftcard`)
  }
  
  if(merchant.company === giftcard.type) {
    throw new customError(`Not a valid ${merchant.company} giftcard`)
  }

  giftcard.holderId = mongoose.Types.ObjectId(req.user._id)
  
  const transfer = {
    newHolderId: reciever._id,
    when: Date.now()
  }

  giftcard.transfers = giftcard.transfers.concat(transfer)

  giftcard.status = 'REDEEMED'

  await giftcard.save()

  res.json({
    success: true,
    message: 'Transaction successful',
    type: giftcard.type,
    amount: giftcard.amount,
    customer: user.username,
    picture: user.profilePicture
  })
  
} catch (e) {
  if(e.name === 'customError') {
    return res.status(404).json({
      success: false,
      error: e.message
    })
  }

  if(e.name === 'Error') {
    return res.status(400).json({
      success: false,
      error: e.message
    })
  }

  res.status(500).json({
    success: false,
    error: e.message,
    message: 'Server currently undergoing maintenance. Please check back shortly'
  })
}
}