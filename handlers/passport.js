const passport = require('passport');
const mongoose = require('mongoose');
//const User = mongoose.model('User');
const Client = mongoose.model('Client');
passport.use(Client.createStrategy());

passport.serializeUser(Client.serializeUser());
passport.deserializeUser(Client.deserializeUser());
