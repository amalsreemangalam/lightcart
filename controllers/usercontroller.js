const express = require('express')
const router = express.Router()
const collection1 = require("../models/userloginmongodb")
const { Collection1 } = require('mongoose')
const nodemailer = require('nodemailer')
const OTP = require('otp-generator');
const Productcollection = require("../models/productmongo")




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

function generateRandomString(length) {
    return crypto.randomBytes(length).toString('hex');
}

const randomString = generateRandomString(3); // Change 6 to the desired length of OTP

console.log(randomString);





// login get (render)

const login = async (req, res) => {
    console.log(req.session.user);
    const user = req.session.user
    // console.log("session get", user);
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
            email: req.body.email,
            password: req.body.password,
            isBlocked: false
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

            req.session.user = req.body.email;

            // Redirect to OTP page
            res.redirect('/otp');
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};



// const userlogin = async (req, res) => {
//     try {
//         const useremail = req.body.email;  
//         console.log("email",useremail);

//         // Assuming 'collection1' is your MongoDB collection
//         const check = await collection1.findOne({email: useremail });

//         if (check && check.password === req.body.password) {
//             req.session.user = useremail;
//             res.redirect('/home');
//         } else {
//             return res.render('userlogin', { msg: "Invalid username or password" });
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).send('Internal Server Error');
//     }
// }

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
                req.session.user = useremail;
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
        const data = await collection1.findOne({ email: req.session.user });
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

    const product = await Productcollection.find()
    console.log("hvghgfh", product[0]);
    res.render('home', { product: product });

};

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.send("error logging out")
        }
        res.redirect('/userlogin')
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
    productdetails

}


