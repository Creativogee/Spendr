const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../models/userModel')

const userOneId = mongoose.Types.ObjectId()
const userOne = {
  _id: userOneId,
  username: 'Creativogee',
  email: 'creativogee@gmail.com',
  password: 'theBest123',
  tokens: [{
    token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
  }]
}

const setUpDataBase = async () => {
  await User.deleteMany()
  await new User(userOne).save()
}

module.exports = {
  setUpDataBase,
  userOne,
}