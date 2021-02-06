const jwt = require('jsonwebtoken');
const Merchant = require('../models/merchantModel');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const merchant = await Merchant.findOne({
      _id: decoded._id,
      token,
    })

    if (!merchant) {
      throw new Error();
    }
    req.token = token;
    req.merchant = merchant;
    next();
  } catch (e) {
    res.status(401).json({ success: false, error: 'please authenticate' });
  }
};

module.exports = auth;
