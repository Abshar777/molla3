const mongoose = require('mongoose');

const category= new mongoose.Schema({
    name: { type: String, required: true,unique:true },
    gender:{type:String ,required:true},
    active:{type:Boolean ,default:true},
   
})

module.exports=mongoose.model('catgory',category)