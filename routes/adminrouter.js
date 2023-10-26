const express=require('express')
const router=express.Router()
 const admincontroller=require('../controllers/admincontroller')
 const multer=require('multer');

 const session = require('express-session')

 function authenticate(req, res, next) {
     if (req.session.admin) {
         next();
     } else {
         res.redirect('/adminlogin')
     }
 }
 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // Specify the destination folder
  },
  filename: (req, file, cb) => {
    // Generate a unique file name (you can use Date.now() or any other method)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });
  
  
//   const filterFile =  (req,file,callback) =>{
//     if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){
//         callback(null,true);
//         console.log("filter passed");
//     }else{
//         callback(null,false);
//         console.log("filter failed");

//     }
// }
// router.use('/upload', , filterFile);

router.get("/adminlogin",admincontroller.adminlogin)
router.post("/adminlogin",admincontroller.adminloginpost)
router.get('/adminside',admincontroller.dashboard)
router.get('/usermanagement',authenticate,admincontroller.usermanagement)
router.get('/block/:id',admincontroller.userToBlock);

router.get('/unblock/:id',admincontroller.userToUnblock);// Example
router.get('/productmanagement',authenticate,admincontroller.showProductManagementPage)
router.get('/editproduct/:id', admincontroller.editproductget);
router.post('/editproduct/:id',upload.array('filename'), admincontroller.editproductpost);
router.get('/addproduct',admincontroller.addproductget)
router.post('/addproduct',upload.array('image'),admincontroller.addProductPost)
// router.get('/productmanagement',admincontroller.showProductManagementPage)
router.get('/deleteproduct/:id',admincontroller.deleteproduct)
router.get('/admin/logout',admincontroller.logout)
module.exports = router;