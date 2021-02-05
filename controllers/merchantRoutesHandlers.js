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

    await merchant.save()
    // sendWelcomeEmail(merchant.email, merchant.company)
    const token = await merchant.generateAuthToken()

    return res.status(201).json({ success: true, merchant, token })

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