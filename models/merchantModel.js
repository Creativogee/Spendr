const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

const merchantSchema = new Schema({
  company: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
  },

  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    },
  },

  phone: {
    type: Number,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain "password"');
      }

      if (value.length < 7) {
        throw new Error('Password is too short');
      }
    },
  },

  situation: {
    type: String,
    lowercase: true,
    trim: true,
  },

  website: {
    type: String,
    lowercase: true,
    trim: true,
  },
  
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],

  verifyEmail: mongoose.Types.ObjectId,

  profilePicture: {
    type: Buffer,
  }
},

{
  timestamps: true
})

//setting unique indices
merchantSchema.index({
  email: 1,
  company: 1,
  phone: 1
}, {
  unique: true,
})

//creates a virtual property of the user
merchantSchema.virtual('giftcards', {
  ref: 'Giftcard',
  localField: '_id',
  foreignField: 'holderId',
})


//removes password and tokens from response to client
merchantSchema.methods.toJSON = function () {
  const merchant = this
  const merchantObject = merchant.toObject()

  delete merchantObject.password
  delete merchantObject.tokens
  delete merchantObject.verifyEmail
  delete merchantObject.profilePicture

  return merchantObject
};

//Static methods
merchantSchema.statics.findByCredentials = async (email, password, company) => {

  const args = { email, company }
  const param = {};
  for (const prop in args) {
    if (args[prop]) {
      param[prop] = args[prop];
    }
  }
  const merchant = await Merchant.findOne(param);

  if (!merchant) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, merchant.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return merchant;
};


//Instance methods
merchantSchema.methods.generateAuthToken = async function () {
  const merchant = this;
  const token = jwt.sign({ _id: merchant._id.toString() }, process.env.JWT_SECRET);

  return token;
}

//mongoose middleware
merchantSchema.pre('save', async function (next) {
  const merchant = this;

  if (merchant.isModified('password')) {
    merchant.password = await bcrypt.hash(merchant.password, 8);
  }

  next();
});

//Init merchant model and export
const Merchant = mongoose.model('Merchant', merchantSchema)
module.exports = Merchant