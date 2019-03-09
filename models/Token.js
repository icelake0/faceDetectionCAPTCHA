const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');
const jwt = require('jsonwebtoken');
const tokenSchema = new mongoose.Schema({
  clientId: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  token:String
}, {
  toJSON: { virtuals: true },
  toOjbect: { virtuals: true },
});
tokenSchema.statics.validateToken = function(token,key){
  var decoded;
  try {
    decoded = jwt.verify(token, key);
  } catch (e) {
    return Promise.reject(e);
  }
  return Promise.resolve(true);
}

module.exports = mongoose.model('Token', tokenSchema);
