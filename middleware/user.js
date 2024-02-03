const userSchema = require("../models/userSchema");
const user=(req,res,next)=>{
   try{
   
    if(!req.session.login){
        res.redirect('/login')
      }
       next();
   } catch(err){
    console.log(err.message+'       user middleware')
   }
} 

const loginTrue=(req,res,next)=>{
try{
       if(req.session.login){
        res.redirect('/profile')
       }
       next();
}catch(err){
    console.log(err.message+'         login true middileware')
}
}

const userbloack = async (req, res, next) => {
    try {
        
        if (req.session.login) {
            const user = await userSchema.findOne({ _id: req.session.login })

            if (user.is_block === true) {
               
                req.session.destroy((err) => {
                    if (err) {
                       
                        res.send("Error");
                    } else {
                       
                        res.redirect('/');
                    }
                });
            } else {
                // Only call next() if the user is not blocked
                next();
            }
        } else {
            // Only call next() if there is no session login
            next();
        }
    } catch (err) {
        console.log(err.message + ' userBloack middleware ');
    }
};




module.exports={
    user,
    loginTrue,
    userbloack
}
