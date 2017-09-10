function afterImageLoaded(img)
{
  downscale(img, 400, 400)

  .then(function(dataURL) {
    var destImg = document.getElementById('dest')
    destImg.src = dataURL
  })
}

var sourceImg = document.getElementById('source')

if (sourceImg.complete) {
  afterImageLoaded(sourceImg)
}
else {
  sourceImg.addEventListener('load', function(e) {
    afterImageLoaded(this)
  })
}
