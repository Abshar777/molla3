const mongoose = require('mongoose');

const wallet = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    amount:{type:Number , required: true },
    transaction:[{
        amount:{type:Number},
        time:{type: Date, default: Date.now },
        creditOrDebit:{type:String,enum:['debit','credit']}
    }]
 

})

module.exports = mongoose.model('wallet', wallet)