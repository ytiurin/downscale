function afterImageLoaded(img)
{
  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext("2d")

  canvas.width  = img.naturalWidth
  canvas.height = img.naturalHeight

  ctx.drawImage(img, 0, 0)
  var sourceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  var processedImageData = downsample(sourceImageData, 400, 400,
    ((img.naturalWidth - img.naturalHeight) / 2) >> 0, 0,
    img.naturalHeight, img.naturalHeight)

  canvas.width = processedImageData.width
  canvas.height = processedImageData.height

  ctx.putImageData(processedImageData, 0, 0)

  var destImg = document.getElementById('dest')
  destImg.src = canvas.toDataURL('image/jpeg', .85)
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
