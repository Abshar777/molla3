const mongoose = require('mongoose');

const wallet = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    amount:{type:Number , required: true }
 

})

module.exports = mongoose.model('wallet', wallet)