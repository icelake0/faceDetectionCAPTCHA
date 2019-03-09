const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');
const jwt = require('jsonwebtoken');

const initSchema = new mongoose.Schema({
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
module.exports = mongoose.model('Init', initSchema);