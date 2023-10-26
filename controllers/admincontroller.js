const express = require('express')
const router = express.Router()
const productcollection = require("../models/productmongo");

const admincollection = require("../models/adminmongo")
const newcollection = require("../models/userloginmongodb")



const adminlogin = (req, res) => {
    res.render('adminlogin', { msg: '' })
}
const adminloginpost = (req, res) => {
    const thisname = "amal"
    const thispassword = 1234
    req.session.admin=true
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

const showProductManagementPage = async (req, res) => {
    console.log("hi here");
    try {
        const allproduct = await productcollection.find();
        console.log(allproduct); // Retrieve all products from the database
        res.render('productmanagement', {allproduct}); // Pass the products to the EJS template
    } catch (error) {
        console.error(error);
        // Handle the error and send a response to the client
    }
};



const editproductpost = async (req,res) => {
    try {
        const productId = req.params.id;
        console.log("workkkkk");
        console.log(productId);
        let imagePath = req.files.map(file => { return file.path.substring(6) }); // Assuming 'path' is the property where multer stores the file path
        console.log('imagepath1:', imagePath);
        // Check if the path includes "public/" (Windows uses backslashes)
        if (imagePath.includes('public\\')) {
            // Remove the "public/" prefix for Windows
            imagePath = imagePath.replace('public\\', '');
        } else if (imagePath.includes('public/')) {
            // Remove the "public/" prefix for Unix-like systems
            imagePath = imagePath.replace('public/', '');
        }
        console.log(req.body);
        const updatedProductData = {
            productname: req.body.productname,
            productprice: req.body.productprice,
            productdescription: req.body.productdescription,
            productcategory: req.body.productcategory, // Fixed a typo here (changed 'productcatagory' to 'productcategory')
            productstocks: req.body.productstocks,

        };
        // Assuming you have a function to update a product in your model
        const result=await productcollection.findByIdAndUpdate(productId, updatedProductData,{new:true});
        productimage: imagePath
        if (imagePath.length>0) {
            const result=await productcollection.updateOne({_id:productId},{$push:{productimage:imagePath}});
        }
        console.log(`detauks of tehe ${result}`);
        res.redirect('/productmanagement'); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Error editing product');
    }
};




const editproductget = async (req, res) => {
    try {
        const productId = req.params.id;
        const allproduct = await productcollection.findById(productId);
        res.render('editproduct', { allproduct: allproduct });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching product data');
    }
};


   const addproductget=async(req,res)=>{
    // try {
    //     const product = await productcollection.findById(req.params.productId);
    //     res.render('editproduct', { product });
    // } catch (error) {
    //     console.error(error);
    // }
    res.render('addproduct')
}



const addProductPost = async (req, res) => {
    try {
        console.log('addproducts');
        const { productname, productprice, productdescription, productstocks, productcategory,Productimage } = req.body;
        //  const productimage=req.file.filename;
         // Get the uploaded image file path
        let imagePath = req.files.map(file => { return file.path.substring(6) }); // Assuming 'path' is the property where multer stores the file path
        console.log('imagepath1:', imagePath);
        // Check if the path includes "public/" (Windows uses backslashes)
        

console.log('imagePath2',imagePath);
        const newProduct = new productcollection({
            productname,
            productprice,
            productdescription,
            productstocks,
            productcategory,
            productimage: imagePath,

        });
        console.log('newproducts',newProduct);

        await newProduct.save();
        res.redirect('/productmanagement'); // Redirect to a different page after adding the product
    } catch (error) {
        console.error(error);
        // Handle the error and send a response to the client
    }
};
const deleteproduct = async (req, res) => {
    const productId = req.params.id; 

    try {
        const deletedProduct = await  productcollection.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.status(200).json({ message: 'Product deleted successfully', deletedProduct });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.send("error logging out")
        }
        res.redirect('/adminlogin')
    })
}






module.exports = {
    adminlogin,
    adminloginpost,
    dashboard,
    usermanagement,
    userToBlock,
    userToUnblock,
    // productmanagement,
    editproductget,
    editproductpost,
    addproductget,
    addProductPost,
    showProductManagementPage,
    deleteproduct,
    logout



};