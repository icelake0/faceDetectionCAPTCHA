const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const promisify = require('es6-promisify');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const routes = require('./routes/index');
const helpers = require('./helpers');
const errorHandlers = require('./handlers/errorHandlers');
const { catchErrors } = require('./handlers/errorHandlers');
const DetectionController = require('./controllers/DetectionController');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Token =require('./models/Token');
const Client= require('./models/Client');
require('./handlers/passport');

// create our Express app
const app = express();
app.http=require('http').Server(app);
const io = require('socket.io')(app.http);


// view engine setup
app.set('views', path.join(__dirname, 'views')); // this is the folder where we keep our pug files
app.set('view engine', 'pug'); // we use the engine pug, mustache or EJS work great too

// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(express.static(path.join(__dirname, 'public')));

// Takes the raw requests and turns them into usable properties on req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Exposes a bunch of methods for validating data. Used heavily on userController.validateRegister
app.use(expressValidator());

// populates req.cookies with any cookies that came along with the request
app.use(cookieParser());

// Sessions allow us to store data on visitors from request to request

// This keeps users logged in and allows us to send flash messages
const sessionMiddleware=session({
  secret: process.env.SECRET,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
})
//making the session avalable to scocke.io
io.use((socket,next)=>{
  sessionMiddleware(socket.request, socket.request.res, next)
})
app.use(sessionMiddleware);

// // Passport JS is what we use to handle our logins
app.use(passport.initialize());
app.use(passport.session());

// // The flash middleware let's us use req.flash('error', 'Shit!'), which will then pass that message to the next page the user requests
app.use(flash());

// pass variables to our templates + all requests
app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;
  next();
});

// promisify some callback based APIs
app.use((req, res, next) => {
  req.login = promisify(req.login, req);
  next();
});

// After allllll that above middleware, we finally handle our own routes!
app.use('/', routes);

//this is for socket connections
io.on('connection', function(socket){
  console.log('A user connected for face capture');
  socket.on('ImageCaptured', async function(image){
    try{
      let hasFace = await DetectionController.detectFace(image);
      //console.log('hasFace : ',hasFace);
      let key=socket.request.session.client_key;
      //console.log('.......key.......',socket.request.session);
      //console.log('.....................',socket.request.session)
      //console.log(socket.request.session)
      if(hasFace){
        //generate a token at the point

        let init=socket.request.session.init;
        decoded_init=jwt.verify(init, process.env.APP_KEY);
        let client_email=decoded_init.email;
        let redirect_url=decoded_init.redirect_url;
        let client=await Client.findByEmail(client_email);
        let client_key=await client.key();
        client_key=client_key.token;
        let token = new Token();
        token.clientId=client._id
        token.token = jwt.sign({date : new Date()}, client_key,{expiresIn: 60*10}).toString();
        //lets save our token
        token.save();
        io.to(socket.id).emit('detectionComplete', {token: token.token, redirect_url : redirect_url});
      }else{
        io.to(socket.id).emit('detectionFailed',{});
        console.error('No faced detected');
      }
    }catch(err){
      console.error(err);
    }

    // .then((res)=>{
    //   //console.log('hasface',res)
    // });
    //console.log(hasFace);
    // hasFace.then((res)=>{
    // console.log('has face',res);
    // })
    // .catch(()=>{
    //
    // })
    //io.to(`${socket.id}`).emit('detectionComplete', hasFace);
  });
});

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// One of our error handlers will see if these errors are just validation errors
app.use(errorHandlers.flashValidationErrors);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

// done! we export it so we can start the site in start.js
module.exports = app;
