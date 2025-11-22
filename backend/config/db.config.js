const mongoose = require("mongoose");

const connectToDb = () =>
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() =>
      console.log(`Connected to mongod db successfully.`)
    )
    .catch((err) =>
      console.log(`An error occurered connecting to db.\n ${err}`)
    );

module.exports = connectToDb;
