const Merchant = require('../models/merchantModel');
const { profilePictureUpload } = require('../files/upload')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account')

// @desc    Create a merchant
// @route   POST /api/v1/merchants
// @access  Public
exports.createMerchant = async (req, res, next) => {

  class CustomError extends Error {
    constructor(message) {
      super(message);
      this.name = "customError";
    }
  }

  try {
    const merchant = new Merchant(req.body)
    
    const emailMatch = await Merchant.findOne({
      email: merchant.email,
    })

    if (emailMatch) {
      throw new CustomError('Email is already taken');
    }

    const companyMatch = await Merchant.findOne({
      company: merchant.company,
    })

    if (companyMatch) {
      throw new CustomError('company name is already taken');
    }

    const token = await merchant.generateAuthToken()
    merchant.token = token
    
    await merchant.save()

    sendWelcomeEmail(merchant.email, merchant.company)

    return res.status(201).json({
      success: true, 
      merchant, 
      token 
    })

  } catch (e) {
    if (e.name === 'ValidationError') {
      const messages = Object.values(e.errors).map(value => value.message)

      return res.status(400).json({
        success: false,
        error: messages,
      });
    } else if(e.name === 'customError') {
      return res.status(400).json({
        success: false,
        error: e.message,
      })
    } else {
      return res.status(500).json({
        success: false,
        error: e.message,
      });
    }
  }
}

// @desc    Login a merchant
// @route   POST /api/v1/merchants/login
// @access  Public
exports.loginMerchant = async (req, res) => {
  try {
    const { email, password, company } = req.body

    const merchant = await Merchant.findByCredentials(email, password, company)

    const token = await merchant.generateAuthToken()
    merchant.token = token

    await merchant.save();

    res.status(200).json({
      success: true, 
      merchant, 
      token
    })
  } catch (e) {
    res.status(404).json({
      success: false, 
      error: 'Unable to login' 
    })
  }
}

// @desc    Logout a merchant
// @access  Private
// @route   POST /api/v1/merchants/logout
exports.logoutMerchant = async (req, res) => {
  try {
      req.merchant.token = 'OFFLINE'
      await req.merchant.save()
      return res.json({ success: true, message: 'Logout successful' })
  
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }
}

// @desc    Get merchant profile
// @route   GET /api/v1/merchants/account
// @access  Private
exports.getMerchantProfile = async (req, res) => {
  res.json({ success: true, merchant: req.merchant })
}

// @desc    Update merchant profile
// @route   PATCH /api/v1/merchants
// @access  Private
exports.updateMerchantProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['company', 'phone', 'website', 'email', 'password']

  const isValid = updates.every(update => allowedUpdates.includes(update))

  if (!isValid) {
    return res.status(400).json({
      success: false, 
      error: 'Invalid updates!' 
    })
  }

  try {
    updates.forEach(update => (req.merchant[update] = req.body[update]))
    await req.merchant.save()

    res.send(req.merchant)
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: e.message,
    })  }
}

// @desc    Delete merchant
// @route   POST /api/v1/merchants/delete
// @access  Private
exports.deleteMerchant = async (req, res) => {
  try {
    await req.merchant.remove()
    sendGoodbyeEmail(req.merchant.email, req.merchant.company)
    res.send(req.merchant)
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }
}