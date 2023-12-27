// 
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    description: {
        type: String,
       
    },
    
  
    image:[{
        type: String,
        
    }],
    url: {
        type: String, 
    },
})
        
    
console.log("product connected");

const bannerCollection = mongoose.model('banner', bannerSchema);

module.exports = bannerCollection;

