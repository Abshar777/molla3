const mongoose = require('mongoose');

const product= new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, min: 0, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'catgory', required: true },
    createdAt: { type: String,},
    status: {type:Boolean,default: true  },
    stock: { type: Number, default: 1 },
    images: {type:Array, required:true},
    offer:{type: mongoose.Schema.Types.ObjectId, ref: 'offer'},
    actualPrice:{type: Number}
})




module.exports=mongoose.model('Product',product)