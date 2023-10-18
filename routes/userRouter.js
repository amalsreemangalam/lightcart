const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller'); // Adjust the path based on your project structure

router.get("/usersignup", userController.signup);
router.get("/userlogin",userController.login);
router.post("/usersignup",userController.usersignup)
router.post("/userlogin",userController.userlogin);
router.post('/verifyotp',userController.otpvalidate)
 router.get("/home",userController.home);
 router.get('/otp',userController.verifyotp)
 
 



module.exports = router;
