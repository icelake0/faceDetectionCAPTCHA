const Token = require('../models/Token')
exports.validateToken=(req,res)=>{
	let token = req.body.token;
	Token.validateToken(token,req.body.auth)
	.then(()=>{
    	res.status(200).send({
    		"tokenIsValid": true,
    		"message":"Token is valid"
    	});
	  })
	.catch((e)=>{
	    // TODO this error should be rehandled more approprately
	    // you ma just want to put some string in send
	    res.status(404).send({
	    	"tokenIsValid": false,
    		"message":e.message
	    });
	 });
}