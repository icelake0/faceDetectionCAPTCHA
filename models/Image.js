const cv = require('opencv');
const fs = require("fs");
const promisify = require('es6-promisify');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const imageSchema = new mongoose.Schema({

  imageURL: String,
  containFace : Boolean ,

}, {
  toJSON: { virtuals: true },
  toOjbect: { virtuals: true },
});
imageSchema.methods.detectFace = async function () {
  try{
    const readImage = promisify(cv.readImage);
    const im= await readImage(this.imageURL);
    const detectFaces=promisify(im.detectObject.bind(im));
    faces= await detectFaces(cv.FACE_CASCADE,{});
    if(faces.length){
      return Promise.resolve(true);
    }else{
      return Promise.resolve(false);
    }
  }catch(e){
    console.log(e)
  }

}
imageSchema.methods.deleteImage = function () {
  const unlink = promisify(fs.unlink);
  unlink(this.imageURL);
}

module.exports = mongoose.model('Image', imageSchema);
