const express = require('express')
const router = express.Router()
const productcollection = require("../models/productmongo");
const admincollection = require("../models/adminmongo")
const newcollection = require("../models/userloginmongodb");
const categorycollection = require('../models/category.mongo');
const ordercollection = require("../models/order")
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const moment = require('moment');
const ExcelJS = require('exceljs');
// const ObjectId = mongoose.Types.ObjectId;







const adminlogin = (req, res) => {
    res.render('adminlogin', { msg: '' })
}
const adminloginpost = (req, res) => {

    req.session.admin = true
    console.log(req.body);
    if (process.env.EMAIL === req.body.username && process.env.PASSWORD == req.body.password) {

        res.redirect('/adminside')
    } else {
        res.render('adminlogin', { msg: "invalid username or password" })
    }
}

const dashboard = async (req, res) => {
    try {
        const data = await newcollection.find();




        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

        const endOfWeek = new Date();
        endOfWeek.setHours(23, 59, 59, 999);
        endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));

        const dateRange = [];
        for (let date = startOfWeek; date <= endOfWeek; date.setDate(date.getDate() + 1)) {
            dateRange.push(new Date(date));
        }

        let dayCounts = await ordercollection.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: startOfWeek,
                        $lte: endOfWeek,
                    },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        const xValues = dayCounts.map((day) => `Day ${day._id}`);
        const yValues = dayCounts.map((day) => day.count);
        console.log("startOfWeek", startOfWeek);
        console.log("endOfWeek", endOfWeek);

        const dailyChartData = dateRange.map((date) => {
            const dateString = date.toISOString().split("T")[0];
            const matchingData = dayCounts.find((data) => data._id === dateString);
            return { _id: dateString, totalQuantity: matchingData ? matchingData.totalQuantity : 0 };
        });


        const formattedXValues = xValues.map((dateString) => moment(dateString).format("MMM D"));


        res.render('adminside', { msg: "", find: "", user: data, dayCounts, xValues: formattedXValues, yValues });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

const dashboardData = async (req, res) => {
    const filter = req.body.filter
    let saleData
    let categoryData
    let profitData
    const targetYear = new Date().getFullYear(); //sets the result for one year 
    if (filter == 'MONTHLY') {
        // montly sales daty
        saleData = await ordercollection.aggregate([
            {
                $match: {
                    $expr: { $eq: [{ $year: "$createdAt" }, targetYear] },// Filter orders for the target year
                    // status: { $ne: 'cancelled' } //check the staus of the order
                }
            },
            {
                $project: {
                    month: { $month: "$createdAt" },
                }
            },
            {
                $group: { //grouping the order based on the month and finding the sum
                    _id: "$month",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,//set the id to 0 for avoding id in the result
                    month: {
                        $switch: { //change the month to currsonding string 
                            branches: [
                                { case: { $eq: ["$_id", 1] }, then: "Jan" },
                                { case: { $eq: ["$_id", 2] }, then: "Feb" },
                                { case: { $eq: ["$_id", 3] }, then: "Mar" },
                                { case: { $eq: ["$_id", 4] }, then: "Apr" },
                                { case: { $eq: ["$_id", 5] }, then: "May" },
                                { case: { $eq: ["$_id", 6] }, then: "Jun" },
                                { case: { $eq: ["$_id", 7] }, then: "Jul" },
                                { case: { $eq: ["$_id", 8] }, then: "Aug" },
                                { case: { $eq: ["$_id", 9] }, then: "Sep" },
                                { case: { $eq: ["$_id", 10] }, then: "Oct" },
                                { case: { $eq: ["$_id", 11] }, then: "Nov" },
                                { case: { $eq: ["$_id", 12] }, then: "Dec" }
                            ],
                            default: "Unknown"
                        }
                    },
                    count: 1 //for showing the count
                }
            },
            {
                $sort: {
                    month: 1
                }
            }
        ]);


    }
    else if (filter == "YERALY") {
        // total sale data
        saleData = await ordercollection.aggregate([
            {
                $match: {
                    status: { $ne: 'cancelled' } //check the staus of the order
                }
            },
            {
                $project: {
                    year: { $year: "$createdAt" },//projects the month from the time stamp
                }
            },
            {
                $group: {
                    _id: "$year",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,//set the id to 0 for avoding id in the result
                    year: '$_id',
                    count: 1 //for showing the count
                }
            },
            {
                $sort: {
                    year: 1
                }
            }
        ]);


    }

    return res.status(200).json({ saleData: saleData, filter: filter, categoryData: categoryData, profitData })
}




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
        res.render('productmanagement', { allproduct });
    } catch (error) {
        console.error(error);
        // Handle the error and send a response to the client
    }
};



const editproductpost = async (req, res) => {
    try {   
        const productId = req.params.id;
        const allproduct = await productcollection.findById(productId);
        const enteredProductName = req.body.productname.toLowerCase();
        console.log("entered", enteredProductName);
        // const existingProduct = await productcollection.findOne({

        //     $and: [
        //         { name: { $regex: new RegExp('^' + enteredProductName + '$', 'i') } },
        //         { _id: { $ne: productId } }
        //     ]
        // });
        const existingProduct = await productcollection.findOne({
            productname: { $regex: new RegExp(`^${enteredProductName}$`, 'i') }
        });
        console.log("existssspro", existingProduct);

        if (existingProduct) {
           return res.render('editproduct', { allproduct: allproduct, errorMessage: "PRODUCT EXISTS" })       
        }


        let imagePath = req.files.map(file => { return file.path.substring(6) });   
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


// const editproductpost = async (req, res) => {
//     try {
//         const productId = req.params.id;
//         const allproduct = await productcollection.findById(productId);
//         const enteredProductName = req.body.productname.toLowerCase();
//         console.log("entered", enteredProductName);

//         const existingProduct = await productcollection.findOne({
//             name: { $eq: enteredProductName },
//             _id: { $ne: productId }
//         });
//         console.log("existsss", existingProduct);

//         if (existingProduct) {
//             // Show error message if the product already exists
//             return res.render('editproduct', { allproduct: allproduct, errorMessage: "PRODUCT ALREADY EXISTS" });
//         }

//         let imagePath = req.files.map(file => file.path.substring(6));
//         if (imagePath.includes('public\\')) {
//             imagePath = imagePath.replace('public\\', '');
//         } else if (imagePath.includes('public/')) {
//             imagePath = imagePath.replace('public/', '');
//         }

//         const updatedProductData = {
//             productname: req.body.productname,
//             productprice: req.body.productprice,
//             productdescription: req.body.productdescription,
//             productcategory: req.body.productcategory,
//             productstocks: req.body.productstocks,
//         };

//         // Update the product
//         const result = await productcollection.findByIdAndUpdate(productId, updatedProductData, { new: true });

//         // Add the image path if available
//         if (imagePath.length > 0) {
//             result.productimage.push(imagePath);
//             await result.save();
//         }

//         console.log(`details of the ${result}`);
//         res.redirect('/productmanagement');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Error editing product');
//     }
// };




const editproductget = async (req, res) => {
    try {
        const productId = req.params.id;

        const errorMessage = ""

        const allproduct = await productcollection.findById(productId);
        return res.render('editproduct', { allproduct: allproduct, errorMessage });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching product data');
    }
};


const addproductget = async (req, res) => {


    const categorydata = await categorycollection.find()
    console.log(categorydata);

    res.render('addproduct', { categorydata })
}



const addProductPost = async (req, res) => {

    try {
        console.log('addproducts');
        const { productname, productprice, productdescription, productstocks, productcategory, Productimage, OfferPrice, Discount } = req.body;
        // console.log(offerprice,discount);

        let imagePath = req.files.map(file => { return file.path.substring(6) });


        console.log('imagePath2', imagePath);
        const newProduct = new productcollection({
            productname,
            productprice,
            productdescription,
            productstocks,
            productimage: imagePath,
            productcategory,
            OfferPrice,
            Discount,

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
        res.render('categorymanagement', { category });
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
    try {
        const productId = req.params.id;
        const updatedCategoryData = {
            categoryname: req.body.categoryname,
            categorydescription: req.body.categorydescription
        };

        // Check if the categoryname already exists
        const existingCategory = await categorycollection.findOne({ categoryname: updatedCategoryData.categoryname });
        if (existingCategory && existingCategory._id != productId) {
            // If categoryname already exists for a different category, show an error
            req.flash('error', 'Category already exists');
            return res.redirect(`/editcategory/${productId}`);
        }

        // Update the category
        const result = await categorycollection.findByIdAndUpdate(productId, updatedCategoryData, { new: true });
        if (result) {
            res.redirect('/categorymanagement');
        }
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).send('Internal Server Error');
    }
};






const loadordermanagement = async (req, res) => {
    try {
        const orders = await ordercollection.find({})
            .populate('user', 'name') // Populate the 'user' field and include only the 'name' property
            .populate('products.productId', 'productname') // Populate the 'products' array and include only the 'productname' property of the referenced product
        // .populate({
        //     path: 'products.productId',
        //     select: 'productname quantity', // Include the 'quantity' field in the selection
        // });
        // Extract the desired details from the orders
        const formattedOrders = orders.map(order => ({
            orderId: order._id,
            username: order.customerName,
            orderDate: order.orderDate,
            quantity: order.individualquantity,
            status: order.status,
            address: order.address,
            products: order.products.map(product => ({
                productName: product.productId.productname,
                individualquantity: product.individualquantity,
            })),
        }));
        console.log("formattedOrders", formattedOrders);
        res.render('ordermanagement', { orders: formattedOrders });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
}






const updateOrderStatus = async (req, res) => {
    const orderId = req.params.orderId;
    const newStatus = req.params.newStatus;

    try {
        const order = await ordercollection.findById(orderId);

        if (order.status === 'Cancelled') {
            console.log('Order is already cancelled. Admin cannot change the status.');
            return res.redirect('/ordermanagement');
        }

        const updatedOrder = await ordercollection.findByIdAndUpdate(
            orderId,
            { $set: { status: newStatus } },
            { new: true }
        );

        console.log('Updated Order:', updatedOrder);
        res.redirect('/ordermanagement');
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    updateOrderStatus,
    // other functions...
};






const admindashboard = async (req, res) => {
    try {


        res.redirect('/adminside');
    } catch (error) {
        console.error('Error in admindashboard controller:', error);
        res.status(500).send('Internal Server Error');
    }
};




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




const salesReport = async (req, res) => {
    try {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);
        endDate.setDate(endDate.getDate() + 1);
        console.log("start date", startDate, endDate);
        const orders = await ordercollection.aggregate([
            {
                $match: {
                    orderDate: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $unwind: "$address", // Unwind the array of addresses
            },
            {
                $lookup: {
                    from: "productcollections",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productData",
                },
            },
            {
                $lookup: {
                    from: "collection1",
                    localField: "user",
                    foreignField: "_id",
                    as: "userData",
                },
            },
            {
                $unwind: "$productData",
            },
            {
                $project: {
                    orderId: "$_id",
                    shippingAddress: {
                        city: "$address.city",
                        street: "$address.street",
                        state: "$address.state",
                        country: "$address.country",
                    },
                    productDetail: {
                        productName: "$productData.productname",
                        price: "$productData.productprice",
                    },
                    totalPrice: 1,
                    customerName: 1,
                    orderDate: 1,
                    status: 1,
                    individualquantity: {
                        $map: {
                            input: "$products",
                            as: "product",
                            in: "$$product.productId.individualquantity",
                        },
                    },
                },
            },
        ]);



        if (orders.length === 0) {
            // const errorMessage = "Please provide a valid date";
            // req.flash('error', errorMessage);
            return res.redirect('/admindashboard');
        }
        console.log("orders ", orders)

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add data to the worksheet
        worksheet.columns = [
            { header: 'Product Name', key: 'productDetail.productName', width: 20 },
            { header: 'Customer Name', key: 'customerName', width: 18 },
            { header: 'Street', key: 'shippingAddress.street', width: 15 },
            { header: 'City', key: 'shippingAddress.city', width: 15 },
            { header: 'Country', key: 'shippingAddress.country', width: 15 },
            { header: 'State', key: 'shippingAddress.state', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Total Price', key: 'totalPrice', width: 15 },
            { header: 'Order Date', key: 'orderDate', width: 15 },
            { header: 'individualquantity', key: 'individualquantity', width: 15 },
        ];

        orders.forEach((orderItem) => {
            worksheet.addRow({
                'productDetail.productName': orderItem.productDetail.productName,
                'customerName': orderItem.customerName,
                'shippingAddress.street': orderItem.shippingAddress.street,
                'shippingAddress.city': orderItem.shippingAddress.city,
                'shippingAddress.country': orderItem.shippingAddress.country,
                'shippingAddress.state': orderItem.shippingAddress.state,
                'status': orderItem.status,
                'totalPrice': orderItem.totalPrice,
                'orderDate': orderItem.orderDate,
                'individualquantity': orderItem.individualquantity,
            });
        });


        // Generate the Excel file and send it as a response
        const excelBuffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=excel.xlsx');
        res.send(excelBuffer);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
};





module.exports = {
    adminlogin,
    adminloginpost,
    dashboard,
    dashboardData,
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
    deleteimage,
    salesReport,


};





