const express = require('express')
const router = express.Router()
const collection1 = require("../models/userloginmongodb")
const { Collection1 } = require('mongoose')
const nodemailer = require('nodemailer')
const OTP = require('otp-generator');




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
    const user = req.session.user
    console.log("session get", user);
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
        res.render('usersignup')
    } else {
        res.render('home')
    }
}
const usersignup = async (req, res) => {

    try {

        const data = {
            name: req.body.name,
            password: req.body.password,
            isBlocked: false

        }
        console.log(data);
        await collection1.insertMany([data])
        req.session.user = req.body.name;
        res.render('home')
        const amal = await collection1.findOne({ name: req.body.name })
        console.log(amal);
    } catch (err) {
        console.log(err.message);
    }
}

const userlogin = async (req, res) => {
    const check = await collection1.findOne({ name: req.body.name })
    if (check&&check.isBlocked === false) {
        try {
            const otp = OTP.generate(6, { upperCase: false, specialChars: false });



            // console.log(check);
            if (check.password === req.body.password) {
                req.session.user = req.body.name;
                try {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'amalnair334@gmail.com',
                            pass: 'npkw vwub nmyn pfpd'
                        },
                        debug: true, // Enable debug output
                        logger: true // Log everything to console
                    });

                    // Step 2: Generate OTP


                    const mailOptions = {
                        from: 'amalnair334@gmail.com',
                        to: req.body.name,
                        subject: 'One-Time Password (OTP) for Authentication',
                        text: `Your OTP is: ${otp}`
                    };


                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            return console.error('Error:', error);
                        }
                        console.log('Email sent:', info.response);
                    });


                    check.otp = otp;
                    await check.save()
                    //  console.log(check);

                    // Additional logic for storing OTP or sending it to the user interface
                } catch (error) {
                    console.error('Error:', error);
                }
                res.redirect('/otp'); // Assuming you want to render the OTP entry page

            } else {
                res.render('userlogin')
            }
        } catch {
            console.log("error1");
        }
    } else {
        res.redirect('/userlogin')
    }

};

// const otpvalidate=async(req,res)=>{
//     const{otp}=req.body
// try {
//     const amal=await collection1.findOne({name:req.body.name})
// console.log(amal.otp+"hai");
// res.redirect('/home')
// } catch (error) {
//     res.render("userlogin")
// }
// }
const otpvalidate = async (req, res) => {
    const otp = req.body.otp;
    console.log(otp);
    // const { otp } = req.body;
    try {
        const data = await collection1.findOne({ name: req.session.user });
        console.log(data.otp);

        // console.log(amal);
        if (data.otp === otp) {
            res.redirect('/home'); // Redirect to the home page if OTP is valid
        }


    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error'); // Handle errors appropriately
    }
};
const verifyotp = (req, res) => {
    console.log("worked");
    if (req.session.user) {
        res.render('otp')
    }
}


const home = (req, res) => {
    if (req.session.user) {
        res.render('home');
    } else {
        res.render('userlogin', { msg: "" });
    }
};






module.exports = {
    router,
    signup,
    login,
    usersignup,
    userlogin,
    otpvalidate,
    home,
    verifyotp,
    
}


