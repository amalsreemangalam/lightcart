const mongoose= require("mongoose")
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(()=>{
    console.log("mongodb connecteddddd");
}).catch(()=>{
    console.log("failed to connect");
})

const LogInSchema=new mongoose.Schema({
    name:{
       type:String, 
       required:true
    },
    password:{
        type:String,
        required:true  
     },
    //  otp:{
    //     type:String,
      

    //  }
})


const admincollection=new mongoose.model("admindetails",LogInSchema,'admindetails')
module.exports=admincollection