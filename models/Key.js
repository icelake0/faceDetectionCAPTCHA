const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');
const jwt = require('jsonwebtoken');

const keySchema = new mongoose.Schema({
  // clientId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true
  // },
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
keySchema.statics.validateKey = function (auth) {
  //let Key = this;
  var decoded;
  try {
    decoded = jwt.verify(auth, process.env.APP_KEY);
  } catch (e) {
    return Promise.reject(e);
  }
  return Promise.resolve();
}
module.exports = mongoose.model('Key', keySchema);
