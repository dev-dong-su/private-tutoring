const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  useName: { type: String, require: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: Boolean, required: true, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
