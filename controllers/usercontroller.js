const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const collection1 = require("../models/userloginmongodb")
const { Collection1 } = require('mongoose')
const nodemailer = require('nodemailer')
const OTP = require('otp-generator');
const Productcollection = require("../models/productmongo")
const cartcollection = require('../models/cartmongo')
const categorycollection = require("../models/category.mongo")
const ordercollection = require("../models/order")
const dotenv = require("dotenv").config()
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path')
const bannerCollection = require("../models/bannerMongo")
const wishlistcollection = require("../models/wishlist")







let otp;

const Razorpay = require("razorpay")
const razorpay = new Razorpay({
    key_id: process.env.RAZOR_PAY_ID,
    key_secret: process.env.RAZOR_KEY,
});


function authenticate(req, res, next) {
    if (req.session.user) {
        //  console.log(req.session.body);
        next()
    } else {
        res.render('login', {
            errorMessage: ""
        })
    }
}

const crypto = require('crypto');
const productcollection = require('../models/productmongo')
const newcollection = require('../models/userloginmongodb')
const { use } = require('../routes/userRouter')
const { log } = require('util')
const couponCollection = require('../models/coupenmongo')
const walletcollection = require('../models/walletmongo')

function generateRandomString(length) {
    return crypto.randomBytes(length).toString('hex');
}

const randomString = generateRandomString(3); // Change 6 to the desired length of OTP

console.log(randomString);





// login get (render)

const login = async (req, res) => {
    if (req.session.user) {
        return res.redirect('/')
        next();
    }
    console.log(req.session.user);
    const user = req.session.user
    // console.log("session get", 
    if (!req.session.user) {
        console.log("worked");
        res.render('userlogin', { msg: "" })


        const userlogged = await collection1.find(user)
        if (userlogged.block_status) {
            // res.send(404, ("user blocked by admin"))
            res.redirect('/userlogin')
        }
    } else {
        res.render('home')
    }

    //    console.log("logged",userlogged);   

}


const signup = (req, res) => {
    if (!req.session.user) {
        res.render('usersignup');
    } else {
        res.render('home');
    }
}




const usersignup = async (req, res) => {
    try {
        const expirationMinutes = 1;
        const referral = referalgenerator();
        const existingreferral = req.body.referralcode;


        const hashedpassword = await bcrypt.hash(req.body.password, 10)
        const data = {
            name: req.body.name,
            email: req.body.email,
            password: hashedpassword,
            referral: referral,
            phone: req.body.phone,
            otp: {
                code: OTP.generate(6, { upperCase: false, specialChars: false }),
                expiresAt: new Date(Date.now() + expirationMinutes * 60000),
            },
            isBlocked: false,
        }
        const Existingreferral = await collection1.find({ referral: referral })

        if (Existingreferral) {
            Existingreferral.forEach(async (referral) => {
                Existingreferral.wallet += 100
                await Existingreferral.save()
            })

            data.wallet = 100
        }
        const otp = OTP.generate(6, { upperCase: false, specialChars: false });
        const otpExpiresAt = new Date();
        otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + expirationMinutes);
        data.otp.code = otp;
        const result = await collection1.create(data)
        console.log(result);
        // Assuming you have a valid email field in your signup form
        const recipientEmail = req.body.email;
        console.log(recipientEmail);
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'amalnair334@gmail.com',
                pass: 'npkw vwub nmyn pfpd'
            }
        });

        const mailOptions = {
            from: 'amalnair334@gmail.com',
            to: recipientEmail,
            subject: 'One-Time Password (OTP) for Authentication',
            text: `Your OTP is: ${otp}`
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                return console.error('Error:', error);
            }
            console.log('Email sent:', info.response);

            // Save OTP to the database if email was sent successful

            req.session.user = result._id;

            // Redirect to OTP page
            res.redirect('/otp');
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

function referalgenerator() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const codeLength = 6;
    let randomCode = '';

    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomCode += characters.charAt(randomIndex);
    }

    return randomCode;
}


const newotp = async (req, res) => {


    try {


        otp = OTP.generate(6, { upperCase: false, specialChars: false });



        // Assuming you have a valid email field in your signup form
        // const recipientEmail = req.body.email;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'amalnair334@gmail.com',
                pass: 'npkw vwub nmyn pfpd'
            }
        });

        const mailOptions = {
            from: 'amalnair334@gmail.com',
            to: 'amalnair334@gmail.com',
            subject: 'One-Time Password (OTP) for Authentication',
            text: `Your OTP is: ${otp}`
        };

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                return console.error('Error:', error);
            }
            console.log('Email sent:', info.response);

            // Save OTP to the database if email was sent successful

            // req.session.user = result._id;

            // Redirect to OTP page
            res.render('resentotp');
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }


}

const newotpvalidate = async (req, res) => {
    const otpentered = req.body.otp;

    // const { otp } = req.body;
    try {


        // console.log(amal);
        if (otp == otpentered) {
            res.redirect('/'); // Redirect to the home page if OTP is valid
        } else {
            res.render('otp', { error: "WRONG OTP.please try again." })
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error'); // Handle errors appropriately
    }
};


const userlogin = async (req, res) => {
    try {
        const useremail = req.body.email;
        console.log("email", useremail);

        // Assuming 'collection1' is your MongoDB collection
        const check = await collection1.findOne({ email: useremail });

        if (check) {
            if (check.isBlocked) {
                return res.render('userlogin', { msg: "account was blocked by admin" });
            }
            const passwordcheck = await bcrypt.compare(req.body.password, check.password)
            console.log("password", passwordcheck);
            if (passwordcheck) {
                req.session.user = check._id;
                console.log('loginsession', req.session.user);

                res.redirect('/');
            } else {
                return res.render('userlogin', { msg: "Invalid username or password" });
            }
        } else {
            return res.render('userlogin', { msg: "Invalid username or password" });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send('Internal Server Error');
    }
}


const otpvalidate = async (req, res) => {
    const otp = req.body.otp;
    console.log(otp);
    // const { otp } = req.body;
    try {
        const data = await collection1.findOne({ _id: req.session.user });
        console.log(data.otp);


        // Check if the OTP has expired

        // console.log(amal);
        const currentTimestamp = new Date();


        if (data.otp.code === otp && data.otp.expiresAt > currentTimestamp) {
            console.log('otp verified');
            res.redirect('/'); // Redirect to the home page if OTP is valid
        } else {
            res.render('otp', { error: "WRONG OTP.please try again." })
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error'); // Handle errors appropriately
    }
};
const verifyotp = (req, res) => {
    console.log("workedfdf");
    if (req.session.user) {
        const error = ''
        return res.render('otp', { error })
    }
}






const home = async (req, res) => {
    const banner = await bannerCollection.find();
    let products = null
    const searchTerm = req.query.searchTerm


    const productsPerPage = 8;
    const currentPage = parseInt(req.query.page) || 1;

    const totalProducts = await productcollection.countDocuments();
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    const skip = (currentPage - 1) * productsPerPage;

    if (searchTerm) {

        products = await Productcollection.find({ productname: { $regex: searchTerm, $options: 'i' } });
    } else {

        products = await productcollection.find().skip(skip).limit(productsPerPage);
    }

    const users = await collection1.findById(req.session.user);
    const wallet = await walletcollection.findOne({ customerid: req.session.user });

    if (!wallet) {
        const newwallet = new walletcollection({
            customerid: req.session.user,

        });

        await newwallet.save();
    }


    let userstatus = false;
    if (req.session.user) {
        userstatus = true;
    }

    const category = await categorycollection.find();

    // const product = await Productcollection.find()

    res.render('home', {
        product: products, userstatus, category, products: products, banner,
        currentPage: currentPage,
        totalPages: totalPages,
    });
};





const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.send("error logging out")
        }
        res.redirect('/')
    })
}



const userblockedlogin = (req, res) => {
    res.render('blockeduser')
}

const productdetails = async (req, res) => {
    const productId = req.params.productId;

    try {
        const product = await Productcollection.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.render('productdetails', {
            product,

            productImages: product.productimage
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}



const productaddtocart = async (req, res) => {
    const userid = req.session.user;
    const productId = req.params.productId;

    try {
        const isuser = await collection1.findOne({ _id: userid });
        const isproduct = await productcollection.findById(productId);
        const iscart = await cartcollection.findOne({ userId: isuser._id });

        if (!iscart) {
            const addtocart = new cartcollection({
                userId: isuser._id,
                items: [{
                    product: isproduct._id,
                    quantity: 1,
                    single_product_total_price: isproduct.productprice,
                    individualquantity: isproduct.individualquantity, // assuming this property exists

                }],
                total: isproduct.productprice,
                totalQuantity: 1,
            });

            await addtocart.save();
        } else {
            const isProductInCart = iscart.items.find(
                item => item.product.toString() === productId
            );

            if (isProductInCart) {
                console.log("isProductInCart", isProductInCart);
                isProductInCart.quantity += 1;
                isProductInCart.single_product_total_price += isproduct.productprice;
            } else {
                iscart.items.push({
                    product: isproduct._id,
                    quantity: 1,
                    single_product_total_price: isproduct.productprice,
                    individualquantity: isproduct.individualquantity,
                });
            }

            iscart.total += isproduct.productprice;
            iscart.totalQuantity += 1;

            await iscart.save();
        }

        res.redirect('back');

    } catch (error) {
        console.log("carterror", error);
    }
}



const cart = async (req, res) => {
    if (req.session.user) {
        const cartData = await cartcollection.findOne({ userId: req.session.user });
        const productData = await productcollection.find({});
        console.log('cartData', cartData);

        res.render('cart', { cart: cartData, products: productData });

    } else {
        res.render('home');
    }
}
const removeProduct = async (req, res) => {
    const itemId = req.params.id
    console.log(itemId);
    let userId = req.session.user
    try {
        const cart = await cartcollection.findOne({ userId });


        cart.items = cart.items.filter((item) => !(item.product.equals(itemId)));
        console.log(cart.items);
        await cart.save()
        return res.redirect('/cart')
    } catch (error) {
        console.log(error);
    }
}



const updateCart = async (req, res) => {
    let { itemId, amount } = req.body;
    let userId = req.session.user;
    console.log('updatecart');
    try {
        const cart = await cartcollection.findOne({ userId });

        if (!cart) {
            return res.json({ success: false, message: 'Cart not found' });
        }

        const itemToUpdate = cart.items.find(item => item.product.toString() === itemId);

        if (!itemToUpdate) {
            return res.status(500).json({ success: false, message: 'Item not found in the cart' });
        }

        let product = await Productcollection.findById(itemId);


        if (amount > product.productstocks) {
            return res.json({ success: false, message: 'Product out of stock' });
        }

        itemToUpdate.quantity = amount;
        console.log('itemToUpdate.quantity ', cart);
        itemToUpdate.single_product_total_price = amount * (product.OfferPrice > 0 ? product.OfferPrice : product.productprice);


        await itemToUpdate.save()
        await cart.save();

        res.json({ success: true, message: 'Item quantity updated in the cart', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}



const wishLoad = async (req, res) => {
    try {
        const users = req.session.user
        console.log("userrr", users);

        const product = await wishlistcollection.find({ UserId: users }).populate("Product")
        console.log("productttt", product);
        const user = await collection1.findOne({ _id: users })

        if (user) {
            res.render('wishlist', { product })
        } else {
            throw "User not found"
        }

    }
    catch (err) {
        console.log("Error in Wishlist load", err)

    }
}

const addToWish = async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await productcollection.findOne({ _id: productId })
        const user = await collection1.findOne({ _id: req.session.user });
        if (user && product) {
            const isExist = await wishlistcollection.findOne({ UserId: user._id, Product: product._id })

            if (!isExist) {
                const data = {
                    UserId: user._id,
                    Product: productId,

                }
                const result = await wishlistcollection.insertMany([data])
                console.log("Add to wish list successfull")
            } else {
                console.log("Product already exist in your wishlist");
            }

        } else {
            throw "Product or User Not Found"
        }

        res.redirect('/')


    } catch (error) {
        console.log("Error adding to wishlist", error)

    }
}

const removeFromWishlist = async (req, res) => {
    const userId = req.session.user;
    const productId = req.params.id;
    console.log("iddd", productId);

    try {

        const user = await collection1.findOne({ _id: userId });
        console.log("uuuuu", user);

        if (user) {
            const wish = await wishlistcollection.findOne({ UserId: user._id })
            console.log("listttt", wish);
            const wishlistItem = await wishlistcollection.findOneAndRemove({
                UserId: user._id,
                'Product': productId
            });
            res.redirect('/user/wishlist');

        } else {

            console.log('No such user found');
            res.redirect('/');
        }
    } catch (error) {
        console.log('Error removing from wishlist', error);
        res.redirect('user/wishlist');
    }
};

const wishlistAddCart = async (req, res) => {
    const userId = req.session.user;
    const productId = req.params.id;

    try {
        const product = await productcollection.findOne({ _id: productId });
        const user = await collection1.findOne({ _id: userId });
        const existingProductIndex = user.cart.findIndex(item => item.product.toString() === productId);
        if (existingProductIndex !== -1) {

            user.cart[existingProductIndex].quantity += 1;

        } else {

            productPrice = product.price
            offerPrices = product.OfferPrice

            const newCart = {
                product: productId,
                quantity: 1,
                totalPrice: offerPrices > 0 ? offerPrices : productPrice,
            };
            user.cart.push(newCart)
        }
        await user.save();

        const wishlistItem = await wishlistcollection.findOneAndRemove({
            UserId: user._id,
            'Product': productId
        });
        res.redirect('/user/wishlist');

    } catch (error) {
        console.log("Error Adding Product To Cart From Wishlist", error)

    }

}




const userprofileget = async (req, res) => {

    const user = await collection1.findOne({ _id: req.session.user })
    console.log("user", user);
    const wallet = await walletcollection.findOne({ customerid: req.session.user })
    console.log('wa', wallet);
    console.log(user);

    if (req.session.user) {
        res.render('userprofile', { user, walletAmount: wallet.Amount })

    } else {
        res.render('home');
    }

}


const addadress = (req, res) => {

    if (req.session.user) {
        res.render('addadress')

    } else {
        res.render('userprofile');
    }
}
const addadresspost = async (req, res) => {
    const id = req.session.user;
    console.log(id);
    const newAddress = {
        houseName: req.body.houseName,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,


    };

    try {
        const user = await collection1.findOne({ _id: id });
        console.log(user);
        if (user) {
            await collection1.updateOne(
                { _id: id },
                { $push: { address: newAddress } }
            );
            console.log('Address added successfully');
            res.redirect('/userprofile');
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error adding address');
    }
};
const editprofile = async (req, res) => {
    if (req.session.user) {
        const id = req.session.user
        const userdetails = await collection1.findById(id)
        console.log(userdetails);

        res.render('editprofile', { userdetails })
    }
}
const editprofilepost = async (req, res) => {

    try {
        const id = req.session.user
        const filter = { _id: id }; // Assuming id is the user's ID

        console.log("idis:", id)
        const useData = await collection1.findById(id)
        console.log(useData);

        newAddress = {
            
                houseName: req.body.houseName,
                street: req.body.street,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode
        }
        var myquery = { "_id":id , "address._id":req.body.addrId}; 
        var newvalues = { $set: { "address.$.houseName": newAddress.houseName, "address.$.street": newAddress.street, "address.$.city": newAddress.city, "address.$.state": newAddress.state, "address.$.pincode": newAddress.pincode } };
        await collection1.updateOne(myquery, newvalues)

        res.redirect("/userprofile")
    }
    catch (error) {
        console.log(error)
    }
}


const checkout = async (req, res) => {
    const id = req.session.user
    const coupen = await couponCollection.find({ isDeleted: false })
    const user = await collection1.findById(id)
    const cartData = await cartcollection.findOne({ userId: req.session.user }); // Replace this with your actual function to fetch cart data
    const productData = await productcollection.find({});
    if (req.session.user) {
        res.render('checkout', { user, cart: cartData, products: productData, coupen: coupen })
    }
}


const checkoutaddadress = async (req, res) => {
    const user = await collection1.findOne({ _id: req.session.user })
    console.log(user);

    if (req.session.user) {
        res.render('checkoutaddress', { user })

    } else {
        res.send("error")
    }
}



const orderplaced = async (req, res) => {
    try {


        const id = req.params.id

        const userId = req.session.user;
        console.log("id", id);
        console.log("userId", userId);

        const user = await collection1.findOne({ _id: userId });

        const address = await collection1.findOne(
            { _id: userId },
            { address: { $elemMatch: { _id: id } } }
        );

        const addressDetails = address.address.map((address) => {
            return {
                houseName: address.houseName,
                street: address.street,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
            };
        });

        // console.log("addres",formattedAddress);
        const cart = await cartcollection.findOne({ userId: userId });

        // Create an array to store order details
        const orderDetails = [];

        // Iterate through items in the cart and add them to the orderDetails array
        // let totalQuantity = 0;
        const productsInOrder = [];
        for (const cartItem of cart.items) {
            const product = await productcollection.findById(cartItem.product._id);
            // Use cartItem.product._id to get the product ID
            if (product) {
                console.log("cartItem.quantity", cartItem.quantity);
                productsInOrder.push({
                    productId: cartItem.product._id,
                    productName: product.productname,

                    productPrice: product.productprice,
                    individualquantity: cartItem.quantity, // Set the individual quantity or a default value
                    // orderDate:product.orderDate
                });
                // totalQuantity += cartItem.individualquantity;
            }
        }



        // Add orderDetails to the user's orders array
        // Assuming order.array is your array

        const order = new ordercollection({
            user: user._id,
            customerName: user.name,
            orderDate: new Date(),
            products: productsInOrder,
            quantity: cart.totalQuantity,
            totalPrice: cart.total,
            paymentMethod: req.body.method,
            status: 'Pending',
            // individualquantity:cart.individualquantity,
            address: addressDetails,
        });
       


        await order.save();



        // await order.save();

        // Save the updated user document
        await user.save();

        // Empty the user's cart
        cart.items = [];
        cart.discount = 0;
        cart.total = 0;
        cart.totalQuantity = 0;

        // Save the updated cart document
        await cart.save();

        console.log("suceesshekewdwhj");
        return res.send()

    } catch (error) {
        console.error(error);
        // Handle the error and send a response to the client
        res.status(500).send('Internal Server Error');
    }
};

const orderplacedGet = (req, res) => {
    res.render('orderplaced');
}



const paymentonline = async (req, res) => {
    try {
        // Fetch the user's cart and calculate the total price as shown in the previous response
        const total = Number(req.body.totalPrices);
        console.log(total);
        const userId = req.session.user;
        const cart = await cartcollection.findOne({ userId }).populate('items.product');

        // let totalPrice = 0;
        // for (const cartItem of cart.items) {
        //     totalPrice += cartItem.single_product_total_price;
        // }

        // Create a Razorpay order
        const orderOptions = {
            amount: total * 100, // amount in paise
            currency: 'INR', // change it to your currency code
            receipt: 'order_receipt_' + Date.now(),
        };

        const razorpayOrder = await razorpay.orders.create(orderOptions);

        // Return the Razorpay order details to the client
        res.json({
            orderId: razorpayOrder.id,
            amount: total * 100,
            currency: 'INR',
        });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
};



const checkoutaddaddress = (req, res) => {
    res.render("checkoutaddaddress")
}




const checkoutaddaddresspost = async (req, res) => {
    const id = req.session.user;
    console.log(id);
    const newAddress = {
        houseName: req.body.houseName,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
    };

    console.log("adadadadad", newAddress);


    try {
        const user = await collection1.findOne({ _id: id });
        console.log("userrrrrr", user);

        if (user) {
            console.log("iddddddddddd", id);
            const newaddress = await collection1.findOneAndUpdate(
                { _id: id },
                { $push: { address: newAddress } },
                { new: true } // This option returns the updated document
            );

            if (newaddress) {
                console.log("Address added successfully:", newaddress);
                res.redirect('/checkout');
            } else {
                console.log("User not found");
                res.status(404).send('User not found');
            }

        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Error adding address');
    }
};





const checkoutaddaddressedit = async (req, res) => {
    if (req.session.user) {
        const id = req.session.user
        const userdetails = await collection1.findById(id)
        console.log(userdetails);

        const selectedAddress = req.query.selectedAddress
        console.log("this is the selected addresss", selectedAddress);
        res.render('checkoutaddaddressedit', { userdetails, selectedAddress })
    }
}

const checkoutaddaddresseditpost = async (req, res) => {

    try {
        const id = req.session.user

        const filter = { _id: id }; // Assuming id is the user's ID
        const selectedAddress = req.query.selectedAddress
        console.log('ds', selectedAddress);

        console.log("idis:", id)

        const updatedAddress = {
            $set: {
                [`address.${selectedAddress}.houseName`]: req.body.houseName,
                [`address.${selectedAddress}.street`]: req.body.street,
                [`address.${selectedAddress}.city`]: req.body.city,
                [`address.${selectedAddress}.state`]: req.body.state,
                [`address.${selectedAddress}.pincode`]: req.body.pincode,

            }
        };
        console.log('asd', updatedAddress);

        const options = { upsert: true };

        await collection1.updateOne(filter, updatedAddress, options);

        res.redirect("/checkout");
    }
    catch (error) {
        console.log(error)
    }
}
const usercategory = async (req, res) => {
    const category = req.params.id;
    let data
    const categorys = await categorycollection.findOne({ categoryname: category });
    console.log('usercategory', categorys.list);
    if (!categorys) {
        console.log('catergory not found');
        return res.redirect('back')
    }
    if (categorys.list) {
        data = null

    } else {
        data = await productcollection.find({
            productcategory: category
        })
    }

    res.render('usercategory', { data })
}


const myorders = async (req, res) => {
    try {
        const userId = req.session.user;
        if (!userId) {
            return res.redirect('/login');
        }
        const user = await collection1.findOne({ _id: userId })
        console.log("user232", user);
        const orders = await ordercollection.find({ user: userId }).sort({ orderTime: -1 }).populate('products.productId');



        console.log('user.orders:', orders);
        res.render('myorders', { orderItems: orders, user });
    } catch (error) {
        console.error('Error loading orders:', error);
        res.status(500).send('Internal Server Error');
    }
};



const list = async (req, res) => {
    try {
        const categoryid = req.params.categoryid
        const category = await categorycollection.findById(categoryid);
        if (!category) {
            console.log('catergory not found');
            return res.redirect('back')
        }
        category.list = false

        await category.save()
        res.redirect('back')


    } catch (error) {
        console.error('Error loading list:', error);
        res.status(500).send('Internal Server hffor');
    }
}

const unlist = async (req, res) => {
    try {
        const categoryid = req.params.categoryid
        const category = await categorycollection.findById(categoryid);
        if (!category) {
            console.log('catergory not found');
            return res.redirect('back')
        }
        category.list = true

        await category.save()
        res.redirect('back')


    } catch (error) {
        console.error('Error loading list:', error);
        res.status(500).send('Internal Server hffor');
    }
}



const cancelOrder = async (req, res) => {
    try {

        const user = req.session.user
        const orderId = req.params.id;
        console.log('Order ID:', orderId);
        const users = await collection1.findById(user)


        const order = await ordercollection.findById(orderId);
        if (!order) {
            console.log('Order not found');
            return res.redirect('back');
        }

        if (order.status === 'Cancelled') {
            console.log('Order is already cancelled');
            return res.redirect('back');
        }



        if (order.paymentMethod === 'onlinepayment' || order.paymentMethod === 'wallet'||order.paymentMethod==='cashondelivery') {
            const wallet = await walletcollection.findOneAndUpdate(
                { customerid: users._id },
                {
                    $inc: { Amount: (order.totalPrice) },
                    $push: {
                        transactions: {
                            type: 'Refund',
                            amount: (order.totalPrice),
                        },
                    },

                },
                { new: true }
            )
        }

        const updatedOrder = await ordercollection.findByIdAndUpdate(
            orderId,
            { $set: { status: 'Cancelled' } },
            { new: true }
        );

        console.log('Updated Order:', updatedOrder);
        res.redirect('back');
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).send('Internal Server Error');
    }
};

const returnOrder = async (req, res) => {
    try {

        const user = req.session.user

        const orderId = req.params.id;

        const users = await collection1.findById(user)
        const order = await ordercollection.findById(orderId);
        console.log('orrrrrrrrrrr', order);
        if (!order) {
            console.log('Order not found');
            return res.redirect('back');
        }

        if ((order.paymentMethod === 'onlinepayment' || order.paymentMethod === 'cashondelivery' || order.paymentMethod === 'wallet') && order.status === 'Delivered') {
            const wallet = await walletcollection.findOneAndUpdate(
                { customerid: users._id },
                {
                    $inc: { Amount: (order.totalPrice) },
                    $push: {
                        transactions: {
                            type: 'Refund',
                            amount: (order.totalPrice),
                        },
                    },

                },
                { new: true }
            )
        }


        if (order.status === 'Returned') {

            return res.redirect('back');
        }

        const updatedOrder = await ordercollection.findByIdAndUpdate(
            orderId,
            { $set: { status: 'Returned' } },
            { new: true }
        );


        res.redirect('back');
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).send('Internal Server Error');
    }
};



const search = async (req, res) => {

    res.json(products);
};

const searchget = async (req, res) => {
    const searchTerm = req.body.searchTerm;
    const products = await Productcollection.find({ productname: { $regex: searchTerm, $options: 'i' } });
    res.render('search', { products })
}



const invoiceDownload = async (req, res) => {
    const orderId = req.query.orderId;
    console.log('orderId', orderId,);

    let doc = new PDFDocument({ size: "A4", margin: 50 });


    const order = await ordercollection.findById(orderId).populate('products.productId')
    console.log("order", order)
    const total=order.totalPrice
    const tableHeaders = ['Product name', 'Quantity', 'Total Price'];
    const tableRows = [];

    const tableTop = doc.y + 20;
    const tableLeft = 50;
    const cellPadding = 5;

    let grandTotal = 0;

    order.products.forEach(product => {
        const productName = product.productId.productname;
        const quantity = product.individualquantity;
        const totalPrice = quantity * product.productId.productprice;
        grandTotal += totalPrice;
        tableRows.push([productName,quantity,totalPrice]);  
    });

    tableHeaders.forEach((header, i) => {
        doc.text(header, tableLeft + i * 150, tableTop);
    });

    // Draw table rows
    tableRows.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            doc.text(cell.toString(), tableLeft + colIndex * 150, tableTop + (rowIndex + 1) * 20);
        });
    });

    doc.text(`Grand Total With Offer: ${total}`, tableLeft, tableTop + (tableRows.length + 1) * 20);

    console.log(tableRows)


    const pdfDir = 'public/invoice/';

    const pdfPath = path.join(pdfDir, 'sample.pdf');
    console.log(pdfPath);

    doc.end();
    doc.pipe(fs.createWriteStream(pdfPath));


    setTimeout(() => {
        return res.redirect('/invoice/sample.pdf')

    }, 1000)
};

const walletLoad = async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await collection1.findOne({ _id: userId })
        const wallet = await walletcollection.findOne({ customerid: user._id });

        if (wallet) {
            const walletBalance = wallet.Amount;

            const transactions = wallet.transactions;

            res.render('wallet', { walletBalance, transactions });
        } else {
            res.render('wallet', { walletBalance: 0, transactions: [] });
        }
    } catch (error) {
        console.error('Error while fetching wallet balance and transactions:', error);
        res.status(500).send('Internal server error');
    }

}







module.exports = {

    router,
    signup,
    login,
    usersignup,
    userlogin,
    otpvalidate,
    home,
    verifyotp,
    logout,
    productdetails,
    userprofileget,
    productaddtocart,
    cart,
    removeProduct,
    updateCart,
    addadress,
    addadresspost,
    checkout,
    editprofile,
    editprofilepost,
    // checkoutaddadress,
    // checkoutaddaddresspost,
    orderplaced,
    checkoutaddaddress,
    checkoutaddaddresspost,
    checkoutaddaddressedit,
    checkoutaddaddresseditpost,
    newotp,
    newotpvalidate,
    usercategory,
    myorders,
    userblockedlogin,
    list,
    unlist,
    cancelOrder,
    returnOrder,
    paymentonline,
    orderplacedGet,
    search,
    searchget,
    invoiceDownload,
    walletLoad,
    wishLoad,
    addToWish,
    removeFromWishlist,
    wishlistAddCart,
   

}

