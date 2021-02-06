const mongoose = require('mongoose')
const otpGen = require('otp-generator')
const bcrypt = require('bcryptjs')
const { sendOTP } = require('../emails/account')
const Giftcard = require('../models/giftcardModel')
const User = require('../models/userModel')
const Merchant = require('../models/merchantModel')


// @desc    Create a giftcard
// @route   POST /api/v1/account/giftcards
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
// @route   GET /api/v1/account/giftcards
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

    if(req.user.giftcards.length === 0) {
      return res.json({
        success: true, 
        message: 'You do not have any giftcard'
      })
    }

    const giftcards = req.user.giftcards.map(giftcard => {
      return {
        id: giftcard._id,
        type: giftcard.type,
        amount: giftcard.amount,
        status: giftcard.status,
        holder: req.user.username
      }
    })

  res.json({
    giftcards
  })

  } catch (e) {
    res.status(500).json({
      success: false,
      error: e.message
    });
  }
}

// @desc    Recieve giftcards
// @route   POST /api/v1/account/giftcards/transfer/-?trf=recv
// @route   POST /api/v1/account/giftcards/transfer/:id/?trf=send
// @access  Private
exports.transferGiftcards = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    //Recive request
    if(req.query.trf === 'recv') {
      const secret_key = otpGen.generate(8)
      req.user.secret_key = secret_key

      if(user.addresses.length >= 5) {
        throw new Error('Sorry, you have exceeded your address limit')
      }
      
      const address = await user.generateAddress(req)

      if(address) {
        user.addresses = user.addresses.concat({ address })
        res.json({ success: true, address })
        await user.save()
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
        holderId: user._id
      })

      if(!giftcard) {
        throw new Error('Giftcard does not exist')
      }

      if(giftcard.status === 'REDEEMED') {
        throw new Error('Giftcard has been redeemed')
      }

      if(!req.body.otp) {
        const otp = otpGen.generate(6)
        user.otp = otp
        await user.save()
        res.json({succes: true, message: 'A One-Time-Password (OTP) has been sent to you'})

        setTimeout(async () => {
          user.otp = undefined
          await user.save()
        }, 30000)

        return
      }

      if(req.body.otp !== user.otp) {
        throw new Error('OTP is invalid')
      }

      giftcard.holderId = mongoose.Types.ObjectId(reciever._id)
      const transfer = {
        from: req.user._id,
        to: reciever._id,
        when: Date.now()
      }

      giftcard.transfers = giftcard.transfers.concat(transfer)
      reciever.addresses = reciever.addresses.filter(address => {
        return address.address !== req.body.address
      })
      
      await reciever.save()
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
      return res.status(400).json({
        success: false, 
        error: e.message
      })
    }

    res.status(500).json({
      success: false, 
      error: e.message
    })
  }
}

// @desc    Scan giftcards
// @route   POST /api/v1/account/giftcards/:id/:spendr
// @access  Private
exports.scanGiftcards = async (req, res, next) => {
  class CustomError extends Error {
    constructor(message) {
      super(message);
      this.name = "customError";
    }
  }
  
try {
  const user = await User.findOne({username: req.params.spendr})
  const giftcard = await Giftcard.findOne({_id: req.params.id, holderId: user._id})

  if(!giftcard) {
    throw new CustomError(`Not a valid ${req.merchant.company} giftcard`)
  }
  
  if(giftcard.status === 'REDEEMED') {
    throw new CustomError('Giftcard has been redeemed')
  }

  if(user._id === giftcard.holderId) {
    throw new CustomError(`Not a valid ${req.merchant.company} giftcard`)
  }
  
  if(req.merchant.company === giftcard.type) {
    throw new CustomError(`Not a valid ${req.merchant.company} giftcard`)
  }

  giftcard.holderId = mongoose.Types.ObjectId(req.merchant._id)
  
  const transfer = {
    from: user._id,
    to: req.merchant._id,
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
    customer: user.name,
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
  })
}
}