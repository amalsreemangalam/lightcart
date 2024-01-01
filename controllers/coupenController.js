const couponCollection = require("../models/coupenmongo")
const collection1 = require("../models/userloginmongodb")



const coupenmanagement = async (req, res) => {
    const coupen = await couponCollection.find({})
    res.render("coupenManagement", { coupen })
}


const addcoupen = async (req, res) => {
    res.render('addCoupen')
}


const insertCoupon = async (req, res) => {
    console.log("coupen", req.body);
    let data = {
        couponName: req.body.couponName,
        couponCode: req.body.couponCode,
        discountAmount: req.body.discountAmount,
        expirationDate: req.body.expirationDate,
        description: req.body.description,
        minimumpurchase: req.body.minimumpurchase,
    }
    try {
        const result = await couponCollection.insertMany([data]);
        if (!result) {
            res.status(400).send("Coupon not added");
        }
        res.redirect('/coupenManagement')
    } catch (error) {
        console.log("Error due to Insert Coupon: ", error);
        res.status(500).send("Error due to Add Coupon");
    }
}

const editcoupen = async (req, res) => {
    try {
        const coupenid = req.params.id;
        const allcoupen = await couponCollection.findById(coupenid);
        res.render('editcoupen', { allcoupen: allcoupen });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching product data');
    }
};


const couponUpdate = async (req, res) => {
    try {
        let id = req.params.id;
        const result = await couponCollection.findByIdAndUpdate(id, {
            couponName: req.body.couponName,
            couponCode: req.body.couponCode,
            discountAmount: req.body.discountAmount,
            expirationDate: req.body.expirationDate,
            description: req.body.description,
            minimumpurchase: req.body.minimumpurchase,
        })
        if (!result) {
            console.log('not found')
        } else {
            res.redirect('/coupenManagement')
        }

    } catch (error) {
        console.log("Error due to Update Coupon: ", error);
        res.status(500).send("Error due to Update Coupon");
    }
}



const couponDelete = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await couponCollection.findByIdAndUpdate(id, { isDeleted: false });
        if (!result) {
            console.log('not found')
        } else {
            res.redirect('/coupenManagement');
        }

    } catch (error) {
        console.log("Error due to Delete Coupon: ", error);
        res.status(500).send("Error due to Delete Coupon");
    }
}




const couponUndelete = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await couponCollection.findByIdAndUpdate(id, { isDeleted: true });
        if (!result) {
            console.log('not found')
        } else {
            res.redirect('/coupenManagement');
        }
    } catch (error) {
        console.log("Error due to unDelete Coupon: ", error);
        res.status(500).send("Error due to unDelete Coupon");
    }
}




const redeemCoupon = async (req, res) => {
    const couponCode = req.body.couponCode
    console.log('coup',req.body.couponCode);
    if (!couponCode) {
        throw new Error("couponcode is not available")
    }

    const redeemCode = await couponCollection.findOne({couponCode:couponCode})
    console.log('code',redeemCode);
    if (redeemCode) {
        if (redeemCode.isDeleted) {
            res.json({ message: "coupon is temporaray blocked" })
        }
        const minimumpurchase = redeemCode.minimumpurchase 
        const expirationDate = redeemCode.expirationDate
        const discountAmount = redeemCode.discountAmount
        console.log("hereee");
        console.log("d",discountAmount,expirationDate,minimumpurchase);
        res.json({ minimumpurchase, expirationDate, discountAmount })
    }
}




module.exports = {
    coupenmanagement, addcoupen, insertCoupon, editcoupen, couponUpdate, couponDelete, couponUndelete, redeemCoupon
}