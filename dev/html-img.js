var sourceImg = document.createElement('img')
sourceImg.height = 400
sourceImg.src    = "../public/1.jpg"
document.body.appendChild(sourceImg)

downscale(sourceImg, 400, 400, {debug: 1},
function(dataURL) {
  var destImg = document.createElement('img')
  destImg.src = dataURL
  document.body.appendChild(destImg)
})
