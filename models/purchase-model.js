const { Schema, model } = require('mongoose');

const PurchaseSchema = new Schema({
  email: { type: String, required: true },
  paypalOrderId: { type: String, unique: true, required: true },
  date: { type: Date, required: true },
  refId: {
    type: Schema.Types.ObjectId,
    unique: false,
    ref: 'User',
    required: false,
  },
  cash: { type: Number, required: true },
  item: { type: String, required: true },
});

module.exports = model('Purchase', PurchaseSchema);
