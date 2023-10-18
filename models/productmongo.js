const mongoose= require("mongoose")
mongoose.connect("mongodb://0.0.0.0/Logindetails")
.then(()=>{
    console.log("mongodb connected");
}).catch(()=>{
    console.log("failed to connect");
})
const productSchema=new mongoose.Schema({
    productname:{
        type:String,
        required:true
    },
    productprice:{
        type:String,
        required:true
    },
    productdescription:{
        type:String,
        required:true
    },
    productcatagory:{
        type:String,
        required:true
    },
    productstocks:{
        type:String,
        required:true
    },
    productimage:{
        data:Buffer,
        type:String,
        filename:String,
    },
})
const productcollection=new mongoose.model("productdetails",productSchema,'productdetails')
module.exports=productcollection