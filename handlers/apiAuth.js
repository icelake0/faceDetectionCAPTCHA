const Key = require('../models/Key');

var apiAuth= (req, res, next) => {
  //first flush the session to be key and redirect_url free
  //req.session.key=undefined;
  req.session.client_key=undefined;
  req.session.redirect_url=undefined;
  // TODO Convert this to get aut form head
  //let token = req.header('x-auth);
  let token = req.body.auth;
  Key.validateKey(token)
  .then(()=>{
    req.session.client_key = token;
    next();
  })
  .catch((e)=>{
    console.error('API AUTH ERROR')
    res.status(401).send(e.message);
  });

  // Client.findByToken(token).then((client) => {
  //   if (!client) {
  //     return Promise.reject();
  //   }
  //   req.client = client;
  //   req.token = token;
  //   next();
  // }).catch((e) => {
  //   // TODO this error should be rehandled more approprately
  //   // you ma just want to put some string in send
  //   res.status(401).send();
  // });
};

module.exports = {apiAuth};
