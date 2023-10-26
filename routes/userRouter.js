const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller'); // Adjust the path based on your project structure

const session = require('express-session')

function authenticate(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/userlogin')
    }
}

router.get("/usersignup",userController.signup);
router.get("/userlogin",userController.login);
router.post("/usersignup",userController.usersignup)
 router.post("/userlogin",userController.userlogin);
router.post('/verifyotp',authenticate,userController.otpvalidate)
 router.get("/home",authenticate,userController.home);
 router.get('/otp',userController.verifyotp)
 router.get('/logout',authenticate,userController.logout)
 router.get('/product/:productId',userController.productdetails)
 



module.exports = router;
