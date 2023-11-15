const express = require('express')
const router = express.Router()
const collection1 = require("../models/userloginmongodb")
const { Collection1 } = require('mongoose')
const nodemailer = require('nodemailer')
const OTP = require('otp-generator');
const Productcollection = require("../models/productmongo")
const cartcollection = require('../models/cartmongo')
const categorycollection=require("../models/category.mongo")



let otp;



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

function generateRandomString(length) {
    return crypto.randomBytes(length).toString('hex');
}

const randomString = generateRandomString(3); // Change 6 to the desired length of OTP

console.log(randomString);





// login get (render)

const login = async (req, res) => {
        if (req.session.user) {
            return res.redirect('/home')
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
            res.send(404, ("user blocked by admin"))
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


        const data = {
            name:req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone:req.body.phone,
            isBlocked: false,
        }
        const otp = OTP.generate(6, { upperCase: false, specialChars: false });
        data.otp = otp;
        const result = await collection1.create(data)
        console.log(result);
        // Assuming you have a valid email field in your signup form
        const recipientEmail = req.body.email;

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

            req.session.user = result._id;

            // Redirect to OTP page
            res.redirect('/otp');
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

const newotp=async(req,res)=>{
  

try{


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
            res.redirect('/home'); // Redirect to the home page if OTP is valid
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
            if (check.password === req.body.password) {
                req.session.user = check._id;
                console.log('loginsession',req.session.user);
                res.redirect('/home');
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

        // console.log(amal);
        if (data.otp === otp) {
            res.redirect('/home'); // Redirect to the home page if OTP is valid
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
        return res.render('otp')
    }
}


const home = async (req, res) => {
    let userstatus = false;
    if (req.session.user) {
        userstatus = true;
    }

const category=await categorycollection.find();

console.log(category);
    const product = await Productcollection.find()
    console.log("hvghgfh", product[0]);
    res.render('home', { product: product, userstatus,category});

};

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.send("error logging out")
        }
        res.redirect('/home')
    })
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
                isProductInCart.quantity += 1;
                isProductInCart.single_product_total_price += isproduct.productprice;
            } else {
                iscart.items.push({
                    product: isproduct._id,
                    quantity: 1,
                    single_product_total_price: isproduct.productprice,
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
        const cartData = await cartcollection.findOne({userId:req.session.user}); // Replace this with your actual function to fetch cart data
        const productData = await productcollection.find({}); 
        console.log(cartData);
        // Fetch product data
        // console.log(`helloo thuis usi caretjk ${productData}`);
        res.render('cart', { cart: cartData, products:productData}); 

    } else {
        res.render('home');
    }
}
const removeProduct=async(req,res)=>{
    const itemId=req.params.id
    console.log(itemId);
    let userId=req.session.user
    try {
        const cart = await cartcollection.findOne({ userId });

        // const itemToUpdate = cart.items.find(item => item.product.toString() === itemId);
        cart.items=cart.items.filter((item)=>!(item.product.equals(itemId)));
        console.log(cart.items);
        await cart.save()
        return res.redirect('/cart')
    }catch(error){
        console.log(error);
    }
}



const updateCart = async (req, res) => {
    let { itemId, amount } = req.body;
    let userId = req.session.user;
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
  
      // Check if the requested quantity exceeds the available stock
      if (amount > product.stock) {
        return res.json({ success: false, message: 'Product out of stock' });
      }
  
      itemToUpdate.quantity = amount;
      itemToUpdate.single_product_total_price = amount * product.productprice;
  
      // Update the total, totalQuantity, or any other relevant fields in the cart if needed
      // cart.total = 
      // cart.totalQuantity = ...
      // ...
  
      await cart.save(); // Save the updated cart
  
      res.json({ success: true, message: 'Item quantity updated in the cart', cart });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
  



const userprofileget = async(req,res)=>{

    const user=await collection1.findOne({_id:req.session.user})
    console.log(user);

    if (req.session.user) {
        res.render('userprofile',{user})

    } else {
        res.render('home');
    }

}

  
const addadress=(req,res)=>{
    
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
const editprofile=async(req,res)=>{
    if(req.session.user){
        const id=req.session.user
        const userdetails=await collection1.findById(id)
        console.log(userdetails);

        res.render('editprofile',{userdetails})
    }
}
const editprofilepost=async(req,res)=>{
   
    try{
     const id=req.session.user
     const filter = { _id: id }; // Assuming id is the user's ID

     console.log("idis:",id)
    
     newAddress={
         address:[{
             houseName: req.body.houseName,
         street: req.body.street,
         city: req.body.city,
         state: req.body.state,
         pincode: req.body.pincode,
        //  country: req.body.country,
         }]
         
        
     }
      
     const option={upsert:true};
     console.log(option);
     console.log(newAddress)
    
     await collection1.updateOne(filter,newAddress,option)

     res.redirect("/userprofile")
    }
    catch(error){
     console.log(error)
   } 
} 


const checkout=async(req,res)=>{
    const id = req.session.user
    const user=await collection1.findById(id)
    const cartData = await cartcollection.findOne({userId:req.session.user}); // Replace this with your actual function to fetch cart data
        const productData = await productcollection.find({}); 
    if(req.session.user){
        res.render('checkout',{user, cart: cartData, products:productData})
    }
}
const checkoutaddadress=async(req,res)=>{
    const user=await collection1.findOne({_id:req.session.user})
    console.log(user);

    if (req.session.user) {
        res.render('checkoutaddress',{user})
    
        } else {
          res.send("error")
        } 
    }
    
    // const checkoutaddaddresspost = async (req, res) => {
    //     const id = req.session.user;
    //     console.log(id);
    //     const newAddress = {
    //         houseName: req.body.houseName,
    //         street: req.body.street,
    //         city: req.body.city,
    //         state: req.body.state,
    //         pincode: req.body.pincode,
            
           
    //     };
    //     try {
    //         const user = await collection1.findOne({ _id: id });
    //         console.log(user);
    //         if (user) {
    //             await collection1.updateOne(
    //                 { _id: id },
    //                 { $push: { address: newAddress } }
    //             );
    //             console.log('Address added successfully');
    //             res.redirect('/checkout');
    //         } else {
    //             res.status(404).send('User not found');
    //         }
    //     } catch (err) {
    //         console.error('Error:', err);
    //         res.status(500).send('Error adding address');
    //     }
 
    const orderplaced=async(req,res)=>{
        try {
            const userId = req.session.user;
            const user = await collection1.findOne({ _id: userId });
            const cart = await cartcollection.findOne({ userId: userId });
    
            // Create an array to store order details
            const orderDetails = [];
    
            // Iterate through items in the cart and add them to the orderDetails array
            for (const cartItem of cart.items) {
                const product = await productcollection.findById(cartItem.product);
                if (product) {
                    orderDetails.push({
                        product: product._id,
                        productName: product.productname,
                        quantity: cartItem.quantity,
                        status: 'Pending', // You can set the status as needed
                        orderDate: new Date(),
                    });
                }
            }
    
            // Add orderDetails to the user's orders array
            user.orders.push(...orderDetails);
    
            // Save the updated user document
            await user.save();
    
            // Empty the user's cart
            cart.items = [];
            cart.discount = 0;
            cart.total = 0;
            cart.totalQuantity = 0;
    
            // Save the updated cart document
            await cart.save();
    
            res.render('orderplaced');
        } catch (error) {
            console.error(error);
            // Handle the error and send a response to the client
            res.status(500).send('Internal Server Error');
        }


        res.render('orderplaced')
    }



    const checkoutaddaddress=(req,res)=>{
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
    
        try {
            const user = await collection1.findOne({ _id: id });
            console.log(user);
            if (user) {
                await collection1.updateOne(
                    { _id: id },
                    { $push: { address: newAddress } }
                );
                console.log('Address added successfully');
                res.redirect('/checkout');
            } else {
                res.status(404).send('User not found');
            }
        } catch (err) {
            console.error('Error:', err);
            res.status(500).send('Error adding address');
        }
    };

    const checkoutaddaddressedit=async(req,res)=>{
        if(req.session.user){
            const id=req.session.user
            const userdetails=await collection1.findById(id)
            console.log(userdetails);
            const selectedAddress = req.query.selectedAddress
            res.render('checkoutaddaddressedit',{userdetails,selectedAddress})
        }
    }

    const checkoutaddaddresseditpost=async(req,res)=>{
   
        try{
         const id=req.session.user
        
         const filter = { _id: id }; // Assuming id is the user's ID
         const selectedAddress = req.query.selectedAddress
            console.log('ds',selectedAddress);
    
         console.log("idis:",id)
        
         const updatedAddress = {
            $set: {
                [`address.${selectedAddress}.houseName`]: req.body.houseName,
                [`address.${selectedAddress}.street`]: req.body.street,
                [`address.${selectedAddress}.city`]: req.body.city,
                [`address.${selectedAddress}.state`]: req.body.state,
                [`address.${selectedAddress}.pincode`]: req.body.pincode,
   
            }
        };
        console.log('asd',updatedAddress);

        const options = { upsert: true };

        await collection1.updateOne(filter, updatedAddress, options);

        res.redirect("/checkout");
        }
        catch(error){
         console.log(error)
       } 
    } 
    const usercategory=(req,res)=>{
        res.render('usercategory')
    }
    const myorders=async(req,res)=>{

        try{
          
            const userId = req.session.user; 
            const user = await newcollection.findOne({ _id: userId }).populate('orders.product');

            console.log('user.orders:', user.orders);
            res.render('myorders',{orderItems:user.orders,user})
    
        }catch (error) {
            console.error('Error loading cart:', error);
            res.status(500).send('Internal Server hffor');
          }
        
    }

    // const cancelOrder=async(req,res)=>{
    //     try{
    //         const orderId = req.params.id;
    //         console.log('ii:',orderId);
    //         const order = await collection.findOneAndUpdate(
    //             { 'orders._id': orderId }, 
    //             { $set: { 'orders.$.status': 'Cancelled' } }, 
    //             { new: true } 
    //         );
           
    //         res.redirect('/user/orders')
       
    
    //     }catch (error) {
    //         console.error('Error loading :', error);
    //         res.status(500).send('Internal Server Error');
    //       }
    // }

    

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
    

}

