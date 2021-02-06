const mongoose = require('mongoose');


const connectDataBase = async () => {

  
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    console.log(`MongoDB Connected to: ${db.connection.host}`)
    console.log(`MONGO_URI: ${db.connection._connectionString}`)
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDataBase;
