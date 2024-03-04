const mongoose=require('mongoose');

const connect=async()=>{
    try{
        const host =await mongoose.connect(process.env.MONGODB_URI);
        console.log(`mongodb conected succefull in  ${host.connection.host}`)
    }catch(err){
        console.log(err.message+'  mongodb connection')
        process.exit()
    }
}

module.exports=connect