const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otpGen = require('otp-generator');

const { Schema } = mongoose;

//Explicitly define user schema
const userSchema = new Schema({
  name: {
    type: String,
    lowercase: true,
    trim: true,
  },

  age: {
    type: Number,
    trim: true,
  },

  phone: {
    type: Number,
    trim: true,
  },

  username: {
    type: String,
    required: [true, 'Please enter a username'],
    trim: true,
    lowercase: true,
    validate(value) {
      if (value.match(/\s/)) {
        throw new Error('Username must be one word');
      }
    },
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

  addresses: [
    {
      address: String,
    },
  ],

  otp: String,

  secret_key: String,

  token: {
    type: String,
    required: true,
  },

  profilePicture: {
    type: Buffer,
  }
},

{
  timestamps: true,
}
);

//setting up unique indices
userSchema.index({
  email: 1,
  username: 1,
  phone: 1
}, {
  unique: true,
})

//creates a virtual property of the user
userSchema.virtual('giftcards', {
  ref: 'Giftcard',
  localField: '_id',
  foreignField: 'holderId',
})


//removes password and token from response to client
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.token
  delete userObject.addresses
  delete userObject.createdAt
  delete userObject.updatedAt
  delete userObject.verifyEmail
  delete userObject.__v
  delete userObject.profilePicture;

  return userObject;
};

//Static methods
userSchema.statics.findByCredentials = async (email, password, username) => {

  const args = { email, username };
  const param = {};
  for (const prop in args) {
    if (args[prop]) {
      param[prop] = args[prop];
    }
  }
  const user = await User.findOne(param);

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

//Instance methods
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

  return token
}

userSchema.methods.generateAddress = async function (req) {
  const user = this
  const address = jwt.sign({ _id: user._id.toString()}, req.user.secret_key, {}, {algorithm: 'RS256'})

  return address
}

//mongoose middleware
userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

//Init user model and export
const User = mongoose.model('User', userSchema)
module.exports = User