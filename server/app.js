const express = require('express');
const morgan = require('morgan');
const userRoutes = require('../routers/userRoutes');
const connectDataBase = require('../db/mongoose');

const app = express();

connectDataBase();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


app.use(express.json());
app.use('/api/users', userRoutes);


module.exports = app