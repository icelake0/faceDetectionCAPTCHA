const socket = io();
const player = document.getElementById('player');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('capture');

const constraints = {
  video: true,
};

captureButton.addEventListener('click', () => {
  context.drawImage(player, 0, 0, canvas.width, canvas.height);
  //console.log(context.getImageData());
  let image=canvas.toDataURL('image/jpeg');
  socket.emit('ImageCaptured', image);
  socket.on('detectionComplete', function(data){
      let form = document.createElement("FORM");
      form.method = "POST";
      form.style.display = "none";
      document.body.appendChild(form);
      let url=data.redirect_url
      form.action = url.replace(/\?(.*)/, function(_, urlArgs) {
        urlArgs.replace(/\+/g, " ").replace(/([^&=]+)=([^&=]*)/g, function(input, key, value) {
        });
        return "";
      });
      input = document.createElement("INPUT");
      input.type = "hidden";
      input.name = decodeURIComponent('token');
      input.value = decodeURIComponent(data.token);
      form.appendChild(input);
      form.submit();
      //window.location.replace("http://www.w3schools.com");
  });
  socket.on('detectionFailed', function(data){
    window.location = window.location.href.split('?')[0]+'?error=error';
  });
  // Stop all video streams.
  player.srcObject.getVideoTracks().forEach(track => track.stop());
});

navigator.mediaDevices.getUserMedia(constraints)
  .then((stream) => {
    // Attach the video stream to the video element and autoplay.
    player.srcObject = stream;
    //console.log(stream);
  });
