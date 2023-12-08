const mongoose = require("mongoose")
// mongoose.connect("mongodb://0.0.0.0/Logindetails")
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("mongodb connected");
    }).catch(() => {
        console.log("failed to connect");
    })

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
    referralCode:{
        type:String,
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
   
})


const newcollection = new mongoose.model("collection1", LogInSchema, 'collection1')
module.exports = newcollection