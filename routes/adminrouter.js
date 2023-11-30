const express=require('express')
const router=express.Router()
 const admincontroller=require('../controllers/admincontroller')
 const multer=require('multer');
 const adminAuth=require("../middleware/adminAuth")

 const session = require('express-session')



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
//     if(file.mikmetype === 'image/png' || file.mimetype === 'image/jpeg'){
//         callbac(null,true);
//         console.log("filter passed");
//     }else{
//         callback(null,false);
//         console.log("filter failed");

//     }
// }
// router.use('/upload', , filterFile);

router.get("/adminlogin",admincontroller.adminlogin)
router.post("/adminlogin",admincontroller.adminloginpost)
router.get('/adminside',adminAuth.adminlogin,admincontroller.dashboard)
router.post('/adminsideData',adminAuth.adminlogin,admincontroller.dashboardData)
router.get('/usermanagement',adminAuth.adminlogin,admincontroller.usermanagement)
router.get('/block/:id',adminAuth.adminlogin,admincontroller.userToBlock);

router.get('/unblock/:id',adminAuth.adminlogin,admincontroller.userToUnblock);
router.get('/productmanagement',adminAuth.adminlogin,admincontroller.showProductManagementPage)
router.get('/editproduct/:id',adminAuth.adminlogin,admincontroller.editproductget);
router.post('/editproduct/:id',upload.array('filename'), admincontroller.editproductpost);
router.get('/addproduct',adminAuth.adminlogin,admincontroller.addproductget)
router.post('/addproduct',upload.array('image'),admincontroller.addProductPost)
router.get('/deleteproduct/:id',adminAuth.adminlogin,admincontroller.deleteproduct)
router.get('/admin/logout',admincontroller.logout)
router.get('/categorymanagement',adminAuth.adminlogin,admincontroller.showcategoryManagementPage)
router.get('/addcategory',adminAuth.adminlogin,admincontroller.addcategoryget)
router.post('/addcategory',adminAuth.adminlogin,admincontroller.addcategory)
router.get('/deletecategory/:id',adminAuth.adminlogin,admincontroller.deletecategory)
router.get('/editcategory/:id',admincontroller.editcategoryget)
router.post('/editcategory/:id',admincontroller.editcategorypost)
router.get("/ordermanagement",adminAuth.adminlogin,admincontroller.loadordermanagement)
router.get('/updateOrderStatus/:userId/:orderId/:newStatus',adminAuth.adminlogin,admincontroller.updateOrderStatus)
router.get('/dashboard',admincontroller.admindashboard)
router.get("/deleteimage", admincontroller.deleteimage)

module.exports = router;