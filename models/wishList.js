const mongoose = require('mongoose');

const wishList = new mongoose.Schema({
    userId: { type: String, required: true },
    products: [{
        productId: { type: mongoose.SchemaTypes.ObjectId,  ref:'Product', }, 
      
    }],
    
 

})

module.exports = mongoose.model('wishList', wishList)