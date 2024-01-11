const express = require('express');
const router = express.Router();
const collection1 = require("../models/userloginmongodb")
const userController = require('../controllers/usercontroller'); // Adjust the path based on your project structure
const coupenController=require('../controllers/coupenController')


const session = require('express-session')
const userAuth=require("../middleware/userAuth")


// function authenticate(req, res, next) {
//     if (req.session.user) {
//         next();
//     } else {
//         res.redirect('/userlogin')
//     }
// }

const userBlock = async (req, res, next) => {
    const session = req.session.user
    console.log('userblock', session);
    const user = await collection1.findById(session)
    console.log('userblock', user.isBlocked);
    if (user.isBlocked) {
        req.session.destroy()

        return res.redirect("/blocked");
    } else {
        next()
    }

}



router.get("/usersignup", userController.signup);
router.get("/userlogin",userController.login);
router.post("/usersignup",userController.usersignup)
router.post("/userlogin", userController.userlogin);
router.post('/verifyotp',userBlock, userController.otpvalidate)
router.get("/",userController.home);
router.get('/otp',userAuth.login, userController.verifyotp)
router.get('/logout',userController.logout)
router.get('/product/:productId',userController.productdetails)
router.get('/userprofile', userAuth.login,userController.userprofileget)
router.get('/cart/:productId',userController.productaddtocart);
router.get('/cart',userAuth.login,userBlock,userController.cart)
router.get('/removeProduct/:id',userAuth.login,userController.removeProduct)
router.post('/updateCart',userController.updateCart)
router.get('/addadress',userAuth.login, userController.addadress)
router.post('/addaddress',userAuth.login, userController.addadresspost)
router.get('/checkout',userAuth.login, userController.checkout)
router.get('/editprofile', userAuth.login,userController.editprofile)
router.post('/editprofile',userAuth.login,userController.editprofilepost)
// router.get('/checkoutaddress',userController.checkoutaddadress)
// router.post('/checkoutaddress',userController.checkoutaddaddresspost)
router.post('/orderplaced/:id',userAuth.login,userController.orderplaced)
router.get('/checkoutaddaddress',userAuth.login, userController.checkoutaddaddress)
router.post('/checkoutaddaddress',userAuth.login, userController.checkoutaddaddresspost)
router.get('/checkoutaddaddressedit/edit',userAuth.login, userController.checkoutaddaddressedit)
router.post('/checkoutaddaddressedit/edit',userAuth.login, userController.checkoutaddaddresseditpost)
router.get('/resentotp',userAuth.login, userController.newotp)
router.post('/resentotp',userAuth.login, userController.newotpvalidate)
router.get('/usercategory/:id',userController.usercategory)
router.get('/myorders',userAuth.login, userBlock,userController.myorders)
 router.get('/cancelOrder/:id/:productId',userAuth.login,userController.cancelOrder)
 router.get('/returnOrder/:id',userController.returnOrder)
router.get('/blocked',userAuth.login, userController.userblockedlogin)
router.get('/list-product/:categoryid',userController.list)
router.get('/unlist-product/:categoryid',userController.unlist)

// payment online 
router.post('/paymentonline',userAuth.login,userController.paymentonline);

router.get('/sucessorder',userAuth.login,userController.orderplacedGet);
router.post('/search',userAuth.login,userController.search)
router.get('/searchget',userAuth.login,userController.searchget);

router.get('/invoiceDownload',userController.invoiceDownload)

router.post('/redeemCoupon',coupenController.redeemCoupon)
 router.get('/wallet',userController.walletLoad)
// router.get("/apply-coupon",coupenController.)
router.get('/user/wishlist',userAuth.login,userController.wishLoad)
router.get('/addtowish/:id',userAuth.login,userController.addToWish)
router.get('/wishlist/remove/:id',userAuth.login,userController.removeFromWishlist)
router.get('/wishlist/cart/:id',userAuth.login,userController.wishlistAddCart)




module.exports = router;
