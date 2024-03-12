const banner=require('../models/banner');

// banner show 
const bannerPage=async(req,res)=>{
    try{
        const bannerData=await banner.find({}) || [];
        res.render('admin/banner',{ admin: req.session.admin, bannerData })
    }catch(err){
        console.log(err.message+'   banner show');
        res.status(400).send(err.message)
    }
}

//banner geting
const bannerDetGet=async(req,res)=>{
    try{
        console.log(req.body)
        const oldBanner= await banner.findOne({name:req.body.name})
        if(oldBanner){
          oldBanner.image=req?.files[0]?.filename?req?.files[0]?.filename:oldBanner.image;
          oldBanner.save()
        }else{
            const banner1= await banner.create({
                name:req.body.name,
                image:req.files[0].filename
              
            })
        }
      
        res.redirect('/admin/banner')
    }catch(err){
        res.status(400).send(err.message)
    }
}

module.exports={
bannerPage,
bannerDetGet
}