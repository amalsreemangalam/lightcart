const adminlogin=async(req,res,next)=>{
    try{
        if(req.session.admin){
            next()
        }
        else{
            res.redirect('/adminlogin');
        }
        
    }catch (error){
        console.log(error.message);
    }
}

const logout=async(req,res,next)=>{
    try{
        if( req.session.admin){
            res.redirect('/adminlogin');
        }
        else{
            next();
        }
        
    }catch(error){
        console.log(error. message);
    }
}

module.exports={
    adminlogin,logout
}


// function authenticate(req, res, next) {
//     if (req.session.admin) {
//         next();
//     } else {
//         res.redirect('/adminlogin')
//     }
// }
