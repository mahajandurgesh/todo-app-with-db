const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

module.exports.init = async function() {
    await mongoose.connect(process.env.MONGODB_URL);
}