const { Schema, model } = require('mongoose');

const WithdrawSchema = new Schema({
  email: { type: String, unique: false, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  card: { type: String, required: true },
  status: { type: String, default: 'pending' },
  cash: { type: Number, required: true, default: 0 },
  date: { type: Date, required: true },
  balanceLeft: { type: Number, required: true },
});

module.exports = model('Withdraw', WithdrawSchema);
