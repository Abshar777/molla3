const changePass=(req,res,next)=>{
    try{
        if(req.session.admin || req.session.login){
            console.log('hello')
            next()
        }else{
            console.log('helkjjo')
            res.redirect('/')
        }

    }catch(err){
        console.log(err.message+'     change pass midelware')
    }
}

module.exports={
    changePass
}