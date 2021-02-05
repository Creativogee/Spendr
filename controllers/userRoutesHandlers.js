const User = require('../models/userModel');
const { profilePictureUpload } = require('../files/upload')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account') 


// @desc    Create a user
// @route   POST /api/users
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
    user.tokens = user.tokens.concat({ token })

    await user.save()
    // sendWelcomeEmail(user.email, user.username)


    return res.status(201).json({ success: true, user, token })

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
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password, username } = req.body

    const user = await User.findByCredentials(email, password, username)

    const token = await user.generateAuthToken();

    res.status(200).json({ success: true, user, token })
  } catch (e) {
    res.status(404).json({ success: false, error: 'Unable to login' })
  }
};

// @desc    Logout a user on current platform or all platforms
// @access  Private
// @route   POST /api/users/logout
// @instc   POST /api/users/logout?sn=all

exports.logoutUser = async (req, res) => {
  try {
    if(Object.keys(req.query).length === 0) {
      req.user.tokens = req.user.tokens.filter(token => {
        return token.token !== req.token
      });
      await req.user.save()
      return res.json({ success: true, message: 'Logout successful' })
    }

    if(req.query.sn === 'all') {
      req.user.tokens = []
      await req.user.save()
      return res.json({ success: true, message: 'Logout on all platforms successful' })
    } 

    res.status(400).send()

  } catch (e) {
    res.status(500).send()
  }
};

// @desc    Get user profile
// @route   GET /api/users/account
// @access  Private
exports.getUserProfile = async (req, res) => {
  res.json({ success: true, user: req.user })
};

// @desc    Update user profile
// @route   PATCH /api/users
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'age', 'email', 'password']

  const isValid = updates.every(update => allowedUpdates.includes(update))

  if (!isValid) {
    return res.status(400).send({ error: 'Invalid updates!' })
  }

  try {
    updates.forEach(update => (req.user[update] = req.body[update]))
    await req.user.save()

    res.send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
};

// @desc    Delete user
// @route   POST /api/users/delete
// @access  Private
exports.deleteUser = async (req, res) => {
  try {
    await req.user.remove()
    // sendGoodbyeEmail(req.user.email, req.user.username)
    res.send(req.user)
  } catch (e) {
    res.status(500).send()
  }
};

// @desc    Upload profilePicture
// @access  Private
// @route   POST /api/users/account/avatar
exports.uploadProfilePicture = async (req, res) => {

  profilePictureUpload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).send({
        error: err.message
      })
    } else if (err) {
      // An unknown/custom error occurred when uploading.
      return res.status(400).json({error: err.message})
    }
    // Everything went fine.
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.profilePicture = buffer
    await req.user.save()
    res.json({
      success: true,
      message: 'Upload successful'
    })
  })

}

// @desc    Read profilePicture
// @access  Private
// @route   GET /api/users/account/avatar
exports.readProfilePicture = async (req, res) => {
  try {
    if(!req.user.profilePicture) {
      throw new Error()
    }

    res.set('Content-Type', 'image/png')
    res.send(req.user.profilePicture)
  } catch (e) {
    res.status(404).send()
  }
}

// @desc    Delete profilePicture
// @access  Private
// @route   DELETE /api/users/account/avatar
exports.deleteProfilePicture = async (req, res) => {
  req.user.profilePicture = undefined
  await req.user.save()
  res.json({
    success: true,
    message: 'Delete successful'
  })
}
