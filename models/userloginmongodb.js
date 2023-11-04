const mongoose= require("mongoose")
mongoose.connect("mongodb://0.0.0.0/Logindetails")
.then(()=>{
    console.log("mongodb connected");
}).catch(()=>{
    console.log("failed to connect");
})

const LogInSchema=new mongoose.Schema({
   name:{
      type:String,
      required:true
   },
    email:{
       type:String, 
       required:true
    },
    password:{
        type:String,
        required:true  
     },
     otp:{
        type:String,
      

     },
     isBlocked:{
        type:Boolean,
        required:false
     },
     phone:{
      type:Number,
      required:true
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
      country: {
          type: String,
          required: true,
      }
  }],
})


const newcollection=new mongoose.model("collection1",LogInSchema,'collection1')
module.exports=newcollection