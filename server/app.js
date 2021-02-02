const express = require('express');
const userRoutes = require('../routers/userRoutes');
const giftcardRoutes = require('../routers/giftcardRoutes')
const connectDataBase = require('../db/mongoose');

const app = express();

connectDataBase();

app.use(express.json());
app.use('/api/v1/users', userRoutes, giftcardRoutes);


module.exports = app