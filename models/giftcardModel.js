const mongoose = require('mongoose');
const {Schema} = mongoose

const giftcardSchema = new Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  holderId: {
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

  transfers: [{
      from: mongoose.Schema.Types.ObjectId,

      to:  mongoose.Schema.Types.ObjectId,

      when: Date
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