const express = require('express');
const router = express.Router();
const collection1 = require("../models/userloginmongodb")
const userController = require('../controllers/usercontroller'); // Adjust the path based on your project structure

const session = require('express-session')

function authenticate(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/userlogin')
    }   
}

const  userBlock = async (req,res,next)=>{  
    const session = req.session.user
    console.log('userblock',session);   
    const user = await collection1.findById(session)
    console.log('userblock',user.isBlocked);
    if (user.isBlocked) {
        res.send(404, ("user blocked by admin"))
    }else{     
        next()
    }   

}

router.get("/usersignup",userController.signup);
router.get("/userlogin",userController.login);    
router.post("/usersignup",userController.usersignup)    
 router.post("/userlogin",userController.userlogin);  
router.post('/verifyotp',authenticate,userBlock,userController.otpvalidate)
 router.get("/home",userController.home);
 router.get('/otp',userController.verifyotp)
 router.get('/logout',authenticate,userController.logout)
 router.get('/product/:productId',userController.productdetails)
 router.get('/userprofile',userController.userprofileget)
router.get('/cart/:productId', authenticate, userController.productaddtocart);
router.get('/cart',authenticate,userBlock,userController.cart)
router.get('/removeProduct/:id',authenticate,userController.removeProduct)
router.post('/updateCart',authenticate,userController.updateCart)
router.get('/addadress',userController.addadress)
router.post('/addaddress',userController.addadresspost)
router.get('/checkout',userController.checkout)
 router.get('/editprofile',userController.editprofile)
router.post('/editprofile',userController.editprofilepost) 
// router.get('/checkoutaddress',userController.checkoutaddadress)
// router.post('/checkoutaddress',userController.checkoutaddaddresspost)
router.get('/orderplaced',authenticate,userController.orderplaced)
router.get('/checkoutaddaddress',userController.checkoutaddaddress)
router.post('/checkoutaddaddress',userController.checkoutaddaddresspost)
router.get('/checkoutaddaddressedit/edit',userController.checkoutaddaddressedit)
router.post('/checkoutaddaddressedit/edit',userController.checkoutaddaddresseditpost)
router.get('/resentotp',userController.newotp)
router.post('/resentotp',userController.newotpvalidate)
router.get('/usercategory',userController.usercategory)
router.get('/myorders',userBlock,userController.myorders)
// router.get('/cancelOrder/:id',userController.cancelOrder)
 
module.exports = router;
