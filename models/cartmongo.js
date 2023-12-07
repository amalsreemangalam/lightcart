const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection1',
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Productcollection',
        required: true,
      },
      productName: String, 
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      single_product_total_price: {
        type: Number,
        // required: true,
        default: 0,
      },
    },
  ],

  total: {
    type: Number,
    default: 0,
  },
  totalQuantity: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
