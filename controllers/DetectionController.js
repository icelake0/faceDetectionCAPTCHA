const cv = require('opencv');
const fs = require("fs");
const promisify = require('es6-promisify');
const { catchErrors } = require('../handlers/errorHandlers');
const Init= require('../models/Init')
const jwt = require('jsonwebtoken');
const Client=require('../models/Client');
const Image=require('../models/Image');
exports.socketConnect = (req, res) => {
  res.render('login', { title: 'Login' });
};
exports.initializeDetection=async (req,res)=>{
    //return redirect to capture face
    redirect_url=req.body.redirect_url;
    let client_key=req.session.client_key;
    let email = jwt.verify(client_key, process.env.APP_KEY).email;
    let client=await Client.findByEmail(email);
    init= new Init();
    init.token=jwt.sign({date : new Date(), email:email, redirect_url:redirect_url},process.env.APP_KEY,{expiresIn: 60*10}).toString();
    init.clientId=client._id;
    await init.save();
    //res.redirect(`captureImage`);
    //codeURIComponent(redirect_url)
    req.session.init=undefined;
    res.status(200).json({
      "init":init.token,
      'message':"iniotializatiion completed"
    });
}
exports.captureImage=(req,res)=>{
  let init=req.params.init;
  req.session.init=init;
  console.log('will now capture face')
  res.render('captureFace');
}

exports.detectFace=async (capturedImage)=>{
  try{
    capturedImage=capturedImage.replace(/^data:image\/jpeg;base64,/, "");
    let imageUrl = "./images/";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 10; i++)
      imageUrl += possible.charAt(Math.floor(Math.random() * possible.length));
    imageUrl+=(new Date()).getTime();
    imageUrl+=".jpg";
    let image = new Image();
    image.imageURL=imageUrl;
    const writeFile = promisify(fs.writeFile);
    await writeFile(image.imageURL, capturedImage, 'base64');
    let hasface=await image.detectFace()
    image.deleteImage();
    return hasface;
    // const readImage = promisify(cv.readImage);
    // const im= await readImage("./images/tempImage.jpg");
    // const detectFaces=promisify(im.detectObject.bind(im));
    // faces= await detectFaces(cv.FACE_CASCADE,{});
    // console.log(faces);
    // if(faces.length){
    //   return true;
    // }else{
    //   return false;
    // }
  }catch(err){
    console.error(err);
  }

  // fs.writeFile("./images/tempImage.jpg", image, 'base64', function(err) {
  //   	if(err){
  //   		console.error('Error File System : ',err);
  //   	}else{
  //   		cv.readImage("./images/mona.png", function(err, im){
	// 		  im.detectObject(cv.FACE_CASCADE, {}, function(err, faces){
	// 		  	if(err){
	// 		  		console.error('ERROR OpenCV : ',err);
  //           return false;
	// 		  	}else{
	// 		  		console.log(faces);
  //           if(faces.length){
  //             return true;
  //           }else{
  //             return false;
  //           }
	// 		  		// for (var i=0;i<faces.length; i++){
	// 			    //   	var x = faces[i]
	// 				 	//     console.log(x);
	// 			    //   	im.ellipse(x.x + x.width/2, x.y + x.height/2, x.width/2, x.height/2);
	// 			    //   	//this will draw a square
	// 			    //   	im.line([x.x,x.y], [x.x, x.y+x.height])
	// 			    //   	im.line([x.x,x.y], [x.x+x.width, x.y])
	// 			    //   	im.line([x.x+x.width,x.y], [x.x+x.width, x.y+x.height])
	// 			    //   	im.line([x.x,x.y+x.height], [x.x+x.width, x.y+x.height])
	// 			    //   	//end of drawing a squate
	// 		      // }
	// 		    	// im.save('./images/out.jpg');
	// 		  	}
	// 		  });
	// 		})
  //   	}
	// });
}
