const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../models/userModel')
const Merchant = require('../../models/merchantModel')

const userOneId = mongoose.Types.ObjectId()
const userOne = {
  _id: userOneId,
  username: 'Creativogee',
  email: 'creativogee@gmail.com', 
  password: 'theBest123',
  tokens: [{
    token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
  }],
}

const merchantOneId = mongoose.Types.ObjectId()
const merchantOne = {
  _id: merchantOneId,
  company: 'Beehance',
  email: 'Beehance@mail.com', 
  password: 'santiago456',
  tokens: [{
    token: jwt.sign({_id: merchantOneId}, process.env.JWT_SECRET)
  }],
}

const setUpDataBase = async () => {
  await User.deleteMany()
  await new User(userOne).save()
  await Merchant.deleteMany()
  await new Merchant(merchantOne).save()
}

module.exports = {
  userOne,
  userOneId,
  merchantOne,
  merchantOneId,
  setUpDataBase
}