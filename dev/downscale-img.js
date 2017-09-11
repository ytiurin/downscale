var sourceImg = document.getElementById('source')

downscale(sourceImg, 400, 400)

.then(function(dataURL) {
  var destImg = document.createElement('img')
  destImg.src = dataURL
  document.body.appendChild(destImg)
})
