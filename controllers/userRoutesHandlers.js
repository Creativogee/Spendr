const User = require('../models/userModel');
const { profilePictureUpload } = require('../files/upload')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account') 


// @desc    Create a user
// @route   POST /api/v1/users
// @access  Public
exports.createUser = async (req, res, next) => {

  class CustomError extends Error {
    constructor(message) {
      super(message);
      this.name = "customError";
    }
  }

  try {
    const user = new User(req.body)
    
    const emailMatch = await User.findOne({
      email: user.email,
    })

    if (emailMatch) {
      throw new CustomError('Email is already taken');
    }

    const usernameMatch = await User.findOne({
      username: user.username,
    })

    if (usernameMatch) {
      throw new CustomError('Username is already taken');
    }

    const token = await user.generateAuthToken()
    user.token = token
    
    await user.save()
    
    sendWelcomeEmail(user.email, user.username)


    return res.status(201).json({
      success: true, 
      user, 
      token 
    })

  } catch (e) {
    console.log(e)
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
};

// @desc    Login a user
// @route   POST /api/v1/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password, username } = req.body

    const user = await User.findByCredentials(email, password, username)

    const token = await user.generateAuthToken()
    user.token = token
    
    await user.save()

    res.status(200).json({
      success: true, 
      user, 
      token
    })
  } catch (e) {
    res.status(404).json({
      success: false, 
      error: 'Unable to login' 
    })
  }
};

// @desc    Logout a user
// @access  Private
// @route   POST /api/v1/users/logout

exports.logoutUser = async (req, res, next) => {
  try {
    req.user.token = 'OFFLINE'
    await req.user.save()
      return res.json({ success: true, message: 'Logout successful' })
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/v1/users/account
// @access  Private
exports.getUserProfile = async (req, res) => {
  res.json({ success: true, user: req.user })
};

// @desc    Update user profile
// @route   PATCH /api/v1/users
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'age', 'email', 'password']

  const isValid = updates.every(update => allowedUpdates.includes(update))

  if (!isValid) {
    return res.status(400).json({
      success: false, 
      error: 'Invalid updates!' 
    })
  }

  try {
    updates.forEach(update => (req.user[update] = req.body[update]))
    await req.user.save()

    res.send(req.user)
  } catch (e) {
    return res.status(400).json({
      success: false,
      error: e.message,
    })  }
};

// @desc    Delete user
// @route   POST /api/v1/users/delete
// @access  Private
exports.deleteUser = async (req, res) => {
  try {
    await req.user.remove()
    sendGoodbyeEmail(req.user.email, req.user.username)
    res.json({success: true, message: 'Delete user successful', user: req.user})
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }
};

// @desc    Upload profilePicture
// @access  Private
// @route   POST /api/v1/users/account/avatar
exports.uploadProfilePicture = async (req, res) => {
  
  try {
    profilePictureUpload(req, res, async (err) => {

    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).send({
        error: err.message
      })
    } else if (err) {
      // An unknown/custom error occurred when uploading.
      return res.status(400).json({
        success: false,
        error: e.message,
      })
    }
    // Everything went fine.
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()

    const {user, merchant} = req
    const targets = {user, merchant}

    for(const prop in targets ) {
      if(req[prop]) {
        req[prop].profilePicture = buffer
        req[prop].save()

        return res.json({
          success: true,
          message: 'Upload successful'
        })
      }
    }

    return res.status(400).json({
      success: false,
      error: e.message,
    })
  })
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }


}

// @desc    Read profilePicture
// @access  Private
// @route   GET /api/v1/users/account/avatar
exports.readProfilePicture = async (req, res) => {
  try {

    const {user, merchant} = req
    const targets = {user, merchant}

    for(const prop in targets ) {
      if(req[prop]) {
        if(!req[prop].profilePicture) {
          throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(req[prop].profilePicture)
      }
    }
  } catch (e) {
    res.status(404).json({
      success: false,
      error: 'No image found'
    })
  }
}

// @desc    Delete profilePicture
// @access  Private
// @route   DELETE /api/v1/users/account/avatar
exports.deleteProfilePicture = async (req, res) => {
  try {
    const {user, merchant} = req
    const targets = {user, merchant}

  for(const prop in targets ) {
    if(req[prop] && req[prop].profilePicture) {
      req[prop].profilePicture = undefined
      await req[prop].save()
      
    return res.json({
      success: true,
      message: 'Delete successful'
      })
    }
  }
  res.status(404).json({
    success: false,
    error: 'No image found'
  })
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: e.message,
    });
  }

}
