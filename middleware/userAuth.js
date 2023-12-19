const login = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/userlogin');
    }
};

const logout=async(req,res,next)=>{

    try{

        if(req.session.user){
            res.redirect('/');
        }
        next();
    }catch(error){
        console.log(error.message);
    }

}

module.exports={
    login,logout
}