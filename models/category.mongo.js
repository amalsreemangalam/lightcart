// 
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryname: {
        type: String,
        // required: true
    },
    
    categorydescription: {
        type: String,
        // required: true
    },
    
})
        
    
console.log("product connected");

const categorycollection = mongoose.model('categorycollection', categorySchema);

module.exports = categorycollection;
