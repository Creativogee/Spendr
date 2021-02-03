const mongoose = require('mongoose');
const User = require('./userModel');
const {Schema} = mongoose

const giftcardSchema = new Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  holder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  type: {
    type: String,
    trim: true,
    lowercase: true,
    default: 'Spendr Card'
  },

  amount: {
    type: Number,
    required: true,
  },

  transfer: [{
    from: {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      when: Date,
    },

    to: {
      recieverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      when: Date
    },

    refNo: {
      type: String
    }
  }],

  status: {
    type: String,
    default: 'ACTIVE'
  },
},

{
  timestamps: true
})

const Giftcard = mongoose.model('Giftcard', giftcardSchema)
module.exports = Giftcard