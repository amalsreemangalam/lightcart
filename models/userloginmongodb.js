const mongoose = require("mongoose")


const LogInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, 
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    
    otp: {
        code: {
          type: String,
        }, 
        expiresAt: {
          type: Date,
        },
      },
   
    isBlocked: {
        type: Boolean,
        required: false
    },
    phone: {
        type: Number,
        required: true
    },
   
    created : {
        type : Date,
        required : true,
        default : Date.now,
    },
    address: [{
        houseName: {
            type: String,
            required: true,
        },
        street: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        pincode: {
            type: Number,
            required: true,
        },
      
    }],

   referral:{
    type:String
   },
   wallet:{
    type:Number,
    default:0
   },
})


const newcollection = new mongoose.model("collection1", LogInSchema, 'collection1')
module.exports = newcollection