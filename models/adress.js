const mongoose = require('mongoose');

const address = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    address: [{
        name: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },

    }]
})

module.exports = mongoose.model('addr', address)