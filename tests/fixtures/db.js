const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../models/userModel')
const Merchant = require('../../models/merchantModel')

const userOneId = mongoose.Types.ObjectId()
const userOne = {
  _id: userOneId,
  username: 'Creativogee',
  email: 'creativogee@mail.com', 
  password: 'theBest123',
  token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET),
}

const merchantOneId = mongoose.Types.ObjectId()
const merchantOne = {
  _id: merchantOneId,
  company: 'Beehance',
  email: 'Beehanc@mail.com', 
  password: 'santiago456',
  token: jwt.sign({_id: merchantOneId}, process.env.JWT_SECRET)
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