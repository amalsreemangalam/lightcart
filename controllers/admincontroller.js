const express = require('express')
const router = express.Router()
const productcollection=require("..models/productmongo");

const admincollection = require("../models/adminmongo")
const newcollection = require("../models/userloginmongodb")

const session = require('express-session')

function authenticate(req, res, next) {
    if (req.session.admin) {
        next();
    } else {
        res.redirect('/adminlogin')
    }
}


const adminlogin = (req, res) => {
    res.render('adminlogin', { msg: '' })
}
const adminloginpost = (req, res) => {
    const thisname = "amal"
    const thispassword = 1234
    console.log(req.body);
    if (thisname === req.body.username && thispassword == req.body.password) {

        res.redirect('/adminside')
    } else {
        res.render('adminlogin', { msg: "invalid username or password" })
    }
}

const dashboard = async (req, res) => {
    console.log(req.session);
    const data = await newcollection.find();
    res.render('adminside', { msg: "", find: "", user: data });
};
const usermanagement = async (req, res) => {
    try {
        console.log("worked");
        const alluser = await newcollection.find({})

        res.render('usermanagement', { alluser: alluser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}


const userToBlock = async (req, res) => {
    try {
        const id = req.params.id
        console.log(id);
        const block = await newcollection.findByIdAndUpdate(id, { isBlocked: true })
        if (!block) {
            res.status(400)
            throw new Error("cannot find user to block");
        }
        console.log("block", block)
        res.redirect('back');
    } catch (error) {
        console.log(error);
    }
}

const userToUnblock = async (req, res) => {
    try {
        const id = req.params.id
        const unBlock = await newcollection.findByIdAndUpdate(id, { isBlocked: false })
        if (!unBlock) {
            res.status(400)
            throw new Error("user cannot been Unblock")
        }
        console.log("basxedc");
        res.redirect('/usermanagement')
    } catch (error) {
        console.log(error)
    }
}

const productmanagement = async (req, res) => {
    const allproduct = await admincollection.find({})// Retrieve or generate the data here
    res.render('productmanagement', { allproduct });
}
const Product = require('../models/product'); // Assuming you have a Product model
const { render } = require('ejs')

// const editproductpost = async (req, res) => {
//     try {
//         const product = await Product.findById(req.params.productId); // Assuming you have a parameter named 'productId' in your route
//         res.render('editproduct', { product }); // Pass the product object to the template
//     } catch (error) {
//         console.error(error);
//         // Handle the error and send a response to the client
//     }
// };
const editproductget = async (req, res) => {
    try {
        const product = await productSchema.findById(req.params.productId); // Assuming you have a parameter named 'productId' in your route
        res.render('editproduct', { product }); // Pass the product object to the template
    } catch (error) {
        console.error(error);
        // Handle the error and send a response to the client
    }
};
  

module.exports = {
    adminlogin,
    adminloginpost,
    dashboard,
    usermanagement,
    userToBlock,
    userToUnblock,
    productmanagement,
    editproductget,
    // editproductpost
    

};