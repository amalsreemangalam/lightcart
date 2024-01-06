const mongoose = require('mongoose');
const orderProducts= new mongoose.Schema({
    productId: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Productscollection', 
      
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

    orderTime: {
        type: Date,
        default: Date.now
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
    
    }],
  
}, {
    timestamps: true
});
const ordercollection=mongoose.model('ordercollection',orderSchema)


module.exports = ordercollection;



