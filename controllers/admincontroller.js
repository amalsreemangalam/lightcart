const express = require('express')
const router = express.Router()
const productcollection = require("../models/productmongo");
const admincollection = require("../models/adminmongo")
const newcollection = require("../models/userloginmongodb");
const categorycollection = require('../models/category.mongo');
const ordercollection = require("../models/order")
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const collection1 = require("../models/userloginmongodb")
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
       
        saleData = await ordercollection.aggregate([
            {
                $match: {
                    $expr: { $eq: [{ $year: "$createdAt" }, targetYear] },

                }
            },
            {
                $project: {
                    month: { $month: "$createdAt" },
                }
            },
            {
                $group: {
                    _id: "$month",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $switch: {
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
                    count: 1
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
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $project: {
                    year: { $year: "$createdAt" },
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


    }else if(filter == "category"){
        saleData = await ordercollection.aggregate([
            { $unwind: "$products" },
            {
              $lookup: {
                from: "productscollections",
                localField: "products.productId",
                foreignField: "_id",
                as: "productDetail"
              }
            },
            { $unwind: "$productDetail" },
            {
              $group: {
                _id: "$productDetail.productcategory",
                count: { $sum: 1 }
              }
            }
           ])
         console.log("Result with Populated Product Details", saleData);
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

        const existingProduct = await productcollection.findOne({
            $and: [
                { productname: { $regex: new RegExp('^' + enteredProductName + '$', 'i') } },
                { _id: { $ne: productId } }
            ]
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
            productcategory: req.body.productcategory,
            productstocks: req.body.productstocks,

        };

        const result = await productcollection.findByIdAndUpdate(productId, updatedProductData);
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
        res.redirect('/productmanagement');
    } catch (error) {
        console.error(error);

    }
};


const deleteproduct = async (req, res) => {
    const productId = req.params.id;

    try {
        const deletedProduct = await productcollection.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }


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

    }
};

const addcategoryget = (req, res) => {
    const error = "";
    res.render('addcategory', { error })
}



const addcategory = async (req, res) => {
    const categoryname = req.body.categoryname.toLowerCase();
    const categorydescription = req.body.categorydescription;


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


        await categorycollection.insertMany([categorydata]);

        res.redirect("/categorymanagement");
    }
};


const deletecategory = async (req, res) => {
    const productId = req.params.id;

    try {
        const deletedcategory = await categorycollection.findByIdAndDelete(productId);




        return res.status(200).json({ message: 'category deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
const editcategoryget = async (req, res) => {
    try {
        const productId = req.params.id;
        const category = await categorycollection.findById(productId);
        const errorMessage=""
        res.render('editcategory', { category: category,errorMessage });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching product data');
    }
};



// const editcategorypost = async (req, res) => {
//     try {
//         const productId = req.params.id;
//         const updatedCategoryData = {
//             categoryname: req.body.categoryname,
//             categorydescription: req.body.categorydescription
//         };


//         const existingCategory = await categorycollection.findOne({ categoryname: updatedCategoryData.categoryname });
//         if (existingCategory && existingCategory._id != productId) {

//             req.flash('error', 'Category already exists');
//             return res.redirect(`/editcategory/${productId}`);
//         }


//         const result = await categorycollection.findByIdAndUpdate(productId, updatedCategoryData, { new: true });
//         if (result) {
//             res.redirect('/categorymanagement');
//         }
//     } catch (error) {
//         console.error('Error updating category:', error);
//         res.status(500).send('Internal Server Error');
//     }
// };


const editcategorypost = async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedCategoryData = {
            categoryname: req.body.categoryname,
            categorydescription: req.body.categorydescription
        };

        const existingCategory = await categorycollection.findOne({
            categoryname: { $regex: new RegExp('^' + updatedCategoryData.categoryname + '$', 'i') }
        });
        
        if (existingCategory && existingCategory._id != productId) {
            const errorMessage = 'Category already exists';
            return res.render('editcategory', { category: req.body.categoryname, errorMessage });
        }
        
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
            .populate('user', 'name')
            .populate('products.productId', 'productname')

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
        
        const excelstartingDate = req.body.startDate;
        const excelendingDate = req.body.enddate;

        const orderCursor = await ordercollection.find({
            createdAt: { $gte: new Date(excelstartingDate), $lte: new Date(excelendingDate) },
        });
        console.log(orderCursor);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet 1");


        worksheet.columns = [
            { header: "Order ID", key: "orderId", width: 30 },
            { header: "User ID", key: "userId", width: 30 },
            { header: "Customer Name", key: "customerName", width: 20 },
            { header: "Order Date", key: "orderDate", width: 20 },
            { header: "Product ID", key: "productId", width: 30 },
            { header: "Quantity", key: "quantity", width: 15 },
            { header: "Total Price", key: "totalPrice", width: 15 },
            { header: "Payment Method", key: "paymentMethod", width: 20 },
            { header: "Status", key: "status", width: 15 },
            { header: "House Name", key: "houseName", width: 20 },
            { header: "Street", key: "street", width: 20 },
            { header: "City", key: "city", width: 20 },
            { header: "State", key: "state", width: 20 },
            { header: "Pincode", key: "pincode", width: 15 },
            { header: "Created At", key: "createdAt", width: 25 },
            { header: "Updated At", key: "updatedAt", width: 25 },
        ];




for (const orderItem of orderCursor) {
    for (const product of orderItem.products) {
        const row = {
            orderId: orderItem._id,
            userId: orderItem.user,
            customerName: orderItem.customerName,
            orderDate: orderItem.orderDate,
            productId: product.productId,
            quantity: product.individualquantity,
            totalPrice: orderItem.totalPrice,
            paymentMethod: orderItem.paymentMethod,
            status: orderItem.status,
            houseName: orderItem.address[0]?.houseName || '',
            street: orderItem.address[0]?.street || '',
            city: orderItem.address[0]?.city || '',
            state: orderItem.address[0]?.state || '',
            pincode: orderItem.address[0]?.pincode || '',
            createdAt: orderItem.createdAt.toISOString(),
            updatedAt: orderItem.updatedAt.toISOString(),
        };
        worksheet.addRow(row);
    }
}

const buffer = await workbook.xlsx.writeBuffer();
res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
res.setHeader("Content-Disposition", "attachment; filename=excel.xlsx");
res.send(buffer);
} catch (error) {
console.error(error);
res.status(500).send("Internal Server Error");
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





