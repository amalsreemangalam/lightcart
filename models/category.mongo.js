// 
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryname: {
        type: String,
        // required: true
        //   unique: true, // Ensure uniqueness
    },
    
    categorydescription: {
        type: String,
        // required: true
    },
    list:{
        type:Boolean,
        default:false,
    }
    
})
        
    
console.log("product connected");

const categorycollection = mongoose.model('categorycollection', categorySchema);

module.exports = categorycollection;
