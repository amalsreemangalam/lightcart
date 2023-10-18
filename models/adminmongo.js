const mongoose= require("mongoose")
mongoose.connect("mongodb://0.0.0.0/Logindetails")
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