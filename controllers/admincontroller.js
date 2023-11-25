const express = require('express')
const router = express.Router()
const productcollection = require("../models/productmongo");
const admincollection = require("../models/adminmongo")
const newcollection = require("../models/userloginmongodb");
const categorycollection = require('../models/category.mongo');
const ordercollection = require("../models/order")
const mongoose = require('mongoose');



const adminlogin = (req, res) => {
    res.render('adminlogin', { msg: '' })
}
const adminloginpost = (req, res) => {
    const thisname = "amal"
    const thispassword = 1234
    req.session.admin = true
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
    try {
        const allproduct = await productcollection.find();
        res.render('productmanagement', { allproduct }); // Pass the products to the EJS template
    } catch (error) {
        console.error(error);
        // Handle the error and send a response to the client
    }
};



const editproductpost = async (req, res) => {
    try {
        const productId = req.params.id;
        console.log("workkkkk");
        let imagePath = req.files.map(file => { return file.path.substring(6) }); // Assuming 'path' is the property where multer stores the file path
        if (imagePath.includes('public\\')) {
            imagePath = imagePath.replace('public\\', '');
        } else if (imagePath.includes('public/')) {
            imagePath = imagePath.replace('public/', '');
        }
        const updatedProductData = {
            productname: req.body.productname,
            productprice: req.body.productprice,
            productdescription: req.body.productdescription,
            productcategory: req.body.productcategory, // Fixed a typo here (changed 'productcatagory' to 'productcategory')
            productstocks: req.body.productstocks,

        };
        // Assuming you have a function to update a product in your model
        const result = await productcollection.findByIdAndUpdate(productId, updatedProductData, { new: true });
        productimage: imagePath
        if (imagePath.length > 0) {
            const result = await productcollection.updateOne({ _id: productId }, { $push: { productimage: imagePath } });
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


const addproductget = async (req, res) => {
    // try {
    //     const product = await productcollection.findById(req.params.productId);
    //     res.render('editproduct', { product });
    // } catch (error) {
    //     console.error(error);
    // }\

    const categorydata = await categorycollection.find()
    console.log(categorydata);

    res.render('addproduct', { categorydata })
}



const addProductPost = async (req, res) => {

    try {
        console.log('addproducts');
        const { productname, productprice, productdescription, productstocks, productcategory, Productimage } = req.body;

        let imagePath = req.files.map(file => { return file.path.substring(6) });


        console.log('imagePath2', imagePath);
        const newProduct = new productcollection({
            productname,
            productprice,
            productdescription,
            productstocks,
            productimage: imagePath,
            productcategory,

        });
        console.log('newproducts', newProduct);

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
        const deletedProduct = await productcollection.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Redirect back to the product management page with a success message
        return res.redirect('/productmanagement?success=Product+deleted+successfully');
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

const showcategoryManagementPage = async (req, res) => {
    console.log("hi here");
    try {
        const category = await categorycollection.find();
        console.log(category);
        res.render('categorymanagement', { category }); // Pass the products to the EJS template
    } catch (error) {
        console.error(error);
        // Handle the error and send a response to the client
    }
};

const addcategoryget = (req, res) => {
    const error = "";
    res.render('addcategory', { error })
}



const addcategory = async (req, res) => {
    const categoryname = req.body.categoryname.toLowerCase(); // Convert to lowercase
    const categorydescription = req.body.categorydescription;

    // Check if a category with the same name (case-insensitive) already exists
    const existingCategory = await categorycollection.findOne({
        categoryname: { $regex: new RegExp(`^${categoryname}$`, 'i') }
    });

    if (existingCategory) {
        const error = "Category already exists";
        res.render("addcategory", { error });
    } else {
        const categorydata = {
            categoryname: categoryname,
            categorydescription: categorydescription
        }

        // Insert the new category
        await categorycollection.insertMany([categorydata]);

        res.redirect("/categorymanagement");
    }
};


const deletecategory = async (req, res) => {
    const productId = req.params.id;

    try {
        const deletedcategory = await categorycollection.findByIdAndDelete(productId);

        // if (!deletedProduct) {
        //     return res.status(404).json({ message: 'Product not found' });
        // }

        return res.status(200).json({ message: 'category deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
const editcategoryget = async (req, res) => {
    try {
        const productId = req.params.id;
        const category = await categorycollection.findById(productId);
        res.render('editcategory', { category: category });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching product data');
    }
};

const editcategorypost = async (req, res) => {
    const productId = req.params.id;
    const updatedcategoryData = {
        categoryname: req.body.categoryname,
        categorydescription: req.body.categorydescription
    };

    const result = await categorycollection.findByIdAndUpdate(productId, updatedcategoryData, { new: true })
    if (result) {

        res.redirect('/categorymanagement')
    }
}
// const loadordermanagement = async (req, res) => {
//     try {
//         // const users = await newcollection.find({ orders: { $exists: true, $ne: [] } }).populate('orders.product');
//         const orders= await ordercollection.find({})

//         // res.render('ordermanagement', { users: users });
//         res.render('ordermanagement',{orders:orders})
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Internal Server Error');
//     }

// }
const loadordermanagement = async (req, res) => {
    try {
        const orders = await ordercollection.find({})
            .populate('user', 'name') // Populate the 'user' field and include only the 'name' property
            .populate('products.productId', 'productname'); // Populate the 'products' array and include only the 'productname' property of the referenced product

        // Extract the desired details from the orders
        const formattedOrders = orders.map(order => ({
            orderId: order._id,
            username: order.user.name,
            orderDate: order.orderDate,
            status: order.status,
            products: order.products.map(product => ({
                productName: product.productId.productname,
                quantity: product.quantity,
            })),
        }));

        res.render('ordermanagement', { orders: formattedOrders });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}




const updateOrderStatus = async (req, res) => {

    const userId = req.params.userId;
    const orderId = req.params.orderId;
    const newStatus = req.params.newStatus;

    try {
        const order = await newcollection.findOneAndUpdate(
            { 'orders._id': orderId },
            { $set: { 'orders.$.status': newStatus } },
            { new: true }

        )
        console.log('oo', order)
        res.redirect('/ordermanagement')

    } catch (error) {
        console.error('Error loading :', error);
        res.status(500).send('Internal Server Error');
    }

}
const admindashboard = (req, res) => {
    res.render('adminside')
}


const deleteimage = async (req, res) => {
    console.log("deleteimage");
    try {
        const productId = req.query.productId;
        let imageUrl = req.query.imageUrl;

        // Escape backslashes
        console.log('query ', imageUrl);

        const product = await productcollection.findById(productId);
        console.log('product.productimage ', product.productimage);

        if (!product) {
            return res.status(404).send("Product not found.");
        }

        const escapedProductImages = product.productimage.map(image => image);

        product.productimage = escapedProductImages.filter(image => image !== imageUrl);
        console.log('product.productimage after deletion: ', product.productimage);

        const updatedProduct = await product.save();

        console.log('updatedProduct ', updatedProduct);

        res.redirect('/productmanagement');
    } catch (error) {
        console.log("Error during image delete:", error);
        return res.status(500).send({ success: false, message: "Error during image delete." });
    }
};






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
    logout,
    showcategoryManagementPage,
    addcategory,
    addcategoryget,
    deletecategory,
    editcategoryget,
    editcategorypost,
    loadordermanagement,
    updateOrderStatus,
    admindashboard,
    deleteimage



};





