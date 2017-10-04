downscale("/public/1.jpg", 400, 400, {debug: 1}).
then(function(dataURL) {
  var destImg = document.createElement('img')
  destImg.src = dataURL
  document.body.appendChild(destImg)
})
