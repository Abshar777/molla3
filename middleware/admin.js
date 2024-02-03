const adminRoute=(req,res,next)=>{
    try{
       if(!req.session.admin){
        res.redirect('/')
       }
       next();
    }catch(err){

    }
}
module.exports={
    adminRoute
}