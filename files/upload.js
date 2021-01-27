require('express')
const multer = require('multer')

//Setting multer options for upload
const profilePictureUpload = multer({
  limits: {
    fileSize: 1000000,
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'))
    }
    cb(null, true)
  },
}).single('picture')


module.exports = {
  profilePictureUpload
}