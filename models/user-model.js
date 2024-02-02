const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isActivated: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  activationLink: { type: String, required: true },
  referalCode: { type: String, unique: true, required: true },
  balance: { type: Number, required: true, default: 0 },
});

module.exports = model('User', UserSchema);
