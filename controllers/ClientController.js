const mongoose = require('mongoose');
//const User = mongoose.model('User');
const Client = mongoose.model('Client');
const Key = require('../models/Key');
const promisify = require('es6-promisify');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('org_name');
  req.checkBody('org_name', 'You must supply the organisation name!').notEmpty();
  req.sanitizeBody('domain_url');
  req.checkBody('domain_url', 'You must supply your domain URL!').notEmpty();
  req.checkBody('email', 'That Email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.sanitizeBody('tel');
  req.checkBody('tel', 'Tel must be number!').notEmpty();
  req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return; // stop the fn from running
  }
  next(); // there were no errors!
};

exports.register = async (req, res, next) => {
  const client = new Client({
    email: req.body.email,
    org_name: req.body.org_name,
    domain_url : req.body.domain_url,
    tel : req.body.tel
  });
  const register = promisify(Client.register, Client);
  try{
    await register(client, req.body.password);
  }catch(err){
    req.flash('error', [err.message]);
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
    return; // stop the fn from running
  }
  //create key
  let key = new Key({
    clientId: client._id,
    token:jwt.sign({salt: client.salt, email: client.email}, process.env.APP_KEY).toString()
  });
  key.save();
  next(); // pass to authController.login
};

exports.account = (req, res) => {
  res.render('account', { title: 'Edit Your Account' });
};

exports.updateAccount = async (req, res) => {
  const updates = {
    org_name: req.body.org_name,
    domain_url:req.body.domain_url,
    tel: req.body.tel,
    email: req.body.email
  };
  const client = await Client.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );
  req.flash('success', 'Updated the profile!');
  res.redirect('back');
};
exports.home= async (req,res)=>{
  client=req.user;
  key = await client.key()
  res.render('home',{client, key})
}
