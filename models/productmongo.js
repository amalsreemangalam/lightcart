// 
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productname: {
        type: String,
        // required: true
    },
    productprice: {
        type: Number,
        // required: true
    },
    productdescription: {
        type: String,
        // required: true
    },
    productcategory: {
        type: String,
        // required: true
    },
    productstocks: {
        type: Number,
        // required: true
    },
    individualquantity: {
        type: Number,
        // required: true,
    },

    productimage:[{
        type: String ,
        
    }]
});
console.log("product connected");

const productcollection = mongoose.model('Productcollection', productSchema);

module.exports = productcollection;
