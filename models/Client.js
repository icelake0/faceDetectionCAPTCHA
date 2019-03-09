const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');
const Key=require('./Key')

const clientSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please Supply an email address'
  },
  org_name: {
    type: String,
    required: 'Please supply the name of your organization',
    trim: true
  },
  domain_url: {
    type: String,
    required: 'Please supply your website domain url',
    trim: true
  },
  tel:Number,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});
clientSchema.methods.key=function (){
  return Key.findOne({
    'clientId': this._id,
  })
}
clientSchema.statics.findByEmail=function(email){
  return this.findOne({email})
}
// userSchema.virtual('gravatar').get(function() {
//   const hash = md5(this.email);
//   return `https://gravatar.com/avatar/${hash}?s=200`;
// });

clientSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
clientSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('Client', clientSchema);
