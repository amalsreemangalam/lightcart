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
    OfferPrice: {
        type:Number,
        default:0
    },
    Discount: Number,
    offerExpiration: {
        type: Date,
        required: false,
    },


    productimage:[{
        type: String ,
        
    }]
});
console.log("product connected"); 

const productcollection = mongoose.model('Productscollection', productSchema);

module.exports = productcollection;
