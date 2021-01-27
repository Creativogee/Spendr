const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDataBase = require('../db/mongoose');
const userRoutes = require('../routers/userRoutes');
const morgan = require('morgan');

dotenv.config({ path: './config/.env' });

connectDataBase();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/users', userRoutes);

app.listen(
  port,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);
