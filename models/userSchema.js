const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  img: { type: String },
  date:{type:String},
  addressId:{ type: mongoose.Schema.Types.ObjectId, ref:'addr'},
  is_admin: { type: Number, required: true, default: 0 },
  is_block:{type:Boolean,required:true,default:false},
  coupens:[{
    ID:{type:String},
    coupenId: { type: mongoose.SchemaTypes.ObjectId,  ref:'coupen' },
  }],
  Referral:{type:String}

});

module.exports = mongoose.model('user', userSchema)