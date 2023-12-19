const mongoose = require('mongoose');
const orderProducts= new mongoose.Schema({
    productId: {
      type: mongoose.Schema.Types.ObjectId, // Assuming each cart item is associated with a product
      ref: 'Productscollection', // Reference to the Product model
      
    },
    individualquantity: {
        type: Number,
        // required: true,
    },
    isCancelled: {
        type: Boolean,
        default: false,
    },
  });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'collection1',
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    individualquantity: {
        type: Number,
        // required: true,
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    products: [orderProducts],
    totalPrice: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
    },
    quantity:{
        type:Number,
        
    },
    paymentMethod:{
        type:String,
    },
    status: {
        type:String,
        default:'Pending'
    },
    address:[{
        houseName: {
            type: String,
          
        },
        street: {
            type: String,
      
        },
        city: {
            type: String,
           
        },
        state: {
            type: String,
           
        },
        pincode: {
            type: Number,
         
        },
        //   country: {
        //       type: String,
        //       required: true,
        //   }
    }],
    // You can add more fields specific to orders here
}, {
    timestamps: true
});
const ordercollection=mongoose.model('ordercollection',orderSchema)


module.exports = ordercollection;



