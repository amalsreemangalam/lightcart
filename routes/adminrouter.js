const express=require('express')
const router=express.Router()
 const admincontroller=require('../controllers/admincontroller')
 const multer=require('multer');


 const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')  // Destination folder for storing uploads
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)) // Define how files are named
    }
  })
  
  const upload = multer({ storage: storage });

  const filterFile =  (req,file,callback) =>{
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){
        callback(null,true);
        console.log("filter passed");
    }else{
        callback(null,false);
        console.log("filter failed");

    }
}
router.use('/upload', upload.single('file'), filterFile);

router.get("/adminlogin",admincontroller.adminlogin)
router.post("/adminlogin",admincontroller.adminloginpost)
router.get('/adminside',admincontroller.dashboard)
router.get('/usermanagement',admincontroller.usermanagement)
router.get('/block/:id',admincontroller.userToBlock);

router.get('/unblock/:id',admincontroller.userToUnblock);// Example
router.get('/productmanagement',admincontroller.productmanagement)
router.get('/editproduct',admincontroller.editproductget)
// router.post('/editproduct',admincontroller.editproductpost) 

module.exports = router;