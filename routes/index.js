const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/ClientController');
const authController = require('../controllers/authController');
const DetectionController = require('../controllers/DetectionController');
const { catchErrors } = require('../handlers/errorHandlers');
const { apiAuth } = require('../handlers/apiAuth');
const ValidationController= require('../controllers/ValidationController')
const request=require('request');
const axios = require('axios');
// Do work here
// router.get('/', (req, res) => {
//   res.render('captureFace');
// });
router.post('/initializeDetection',apiAuth,(req,res)=>{
  //create and use a middleware that will do the cliente confarmation
  //a middleware to validate that a redirect_url was passed to the body
  //you can also use reges for the above tast the ensure it is a valid url
  //let redirect_url = req.body.redirect_url;
  DetectionController.initializeDetection(req,res);
})
router.get('/captureImage/:init',(req,res)=>{
  //create and use a middleware that will do the cliente confarmation
  if(req.query.error){
    req.session.flash={'errors':['No face detected, please try again with a valid face']};
    //console.log(req.url.split('?')[0]);
    return res.redirect(req.url.split('?')[0]);
  }
  DetectionController.captureImage(req,res);
})
router.post('/validateToken',apiAuth,(req,res)=>{
  //create and use a middleware that will do the cliente confarmation
  ValidationController.validateToken(req,res);
})
//router.get('/', catchErrors(storeController.getStores));
router.get('/', authController.isLoggedIn,ClientController.home);
router.get('/login', ClientController.loginForm);
router.post('/login', authController.login);
router.get('/register', ClientController.registerForm);
// 1. Validate the registration data
// 2. register the user
// 3. we need to log them in
router.post('/register',
  ClientController.validateRegister,
  ClientController.register,
  authController.login
);
router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, ClientController.account);
router.post('/account', catchErrors(ClientController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.update)
);
//test application routes
router.get('/test',(req,res)=>{
  //clear the session first of test data befor moving
  req.session.test_info=undefined;
  res.render('test');
})
router.post('/test',(req,res)=>{
  //you can deside to do form validtion first
  //keep this
  req.session.test_info=req.body;
  axios({
    method: 'post',
    url: 'http://localhost:7777/initializeDetection',
    data: {
      "auth":`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzYWx0IjoiN2ZkZmFiNzlkMzY1ZGNkYTVlMWZhYjgxZTA0NDNmOTgzYzk3Y2FiMTBkYWI4OGJlMjA1ZjBhOWE0MTU0ZDk4MCIsImVtYWlsIjoidXNlcjJAZmFjZWJvb2suY29tIiwiaWF0IjoxNTQ5MDI5NjkzfQ.yQ5vn4hUTMekXggogY4iW4Kess391Nk-8ffLMnay28g`,
      "redirect_url":"http://localhost:7777/evaluate",
    }
  }).then(function (response) {
      res.redirect(`http://localhost:7777/captureImage/${response.data.init}`);
  }).catch(function (error) {
      console.log('..................',error);
  });
})
router.post('/evaluate',(req,res)=>{
  //valid validateToken
  axios({
    method: 'post',
    url: 'http://localhost:7777/validateToken',
    data: {
      "auth":`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzYWx0IjoiN2ZkZmFiNzlkMzY1ZGNkYTVlMWZhYjgxZTA0NDNmOTgzYzk3Y2FiMTBkYWI4OGJlMjA1ZjBhOWE0MTU0ZDk4MCIsImVtYWlsIjoidXNlcjJAZmFjZWJvb2suY29tIiwiaWF0IjoxNTQ5MDI5NjkzfQ.yQ5vn4hUTMekXggogY4iW4Kess391Nk-8ffLMnay28g`,
      "token":req.body.token,
    }
  }).then(function (response) {
    if(response.data.tokenIsValid){
      res.json({data:req.session.test_info,token:req.body});
    }else{
      res.send('Invalid CAPTCHA Token');
    }
  }).catch(function (error) {
      console.log('..................',error);
  });
});


module.exports = router;
