const bannerCollection = require("../models/bannerMongo");
const multer=require('multer');

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
    


const addBanner=async(req,res)=>{
    res.render("addBanner")
}


const addBannerPost=async(req,res)=>{
    
    let imagePath = req.files.map(file => { return file.path.substring(6) });
    try{
        const banner={
            image:imagePath,
            description:req.body.description
        }
   await bannerCollection.insertMany([banner])
   res.redirect("/bannerManagement")
    }
    catch(error){
        console.error(error)
    }
}

const bannerManagement=async(req,res)=>{
    try{
        const banner= await bannerCollection.find();
        res.render('bannerManagement',{banner})
    }
    catch(error){
        console.log(error)
    }

}


const deletebanner=async(req,res)=>{
    const bannerId = req.params.id;

    try {
        // Find the banner by ID and delete it
        const deletedBanner = await bannerCollection.findByIdAndDelete(bannerId);

        if (!deletedBanner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        res.json({ success: true, message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};






module.exports={
    bannerManagement,addBannerPost,addBanner,deletebanner
}