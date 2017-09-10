function downscale(source, destWidth, destHeight, options)
{
  options = options || {}

  var canvas = downscale.canvas
  var ctx    = downscale.ctx

  canvas.width  = sourceImg.naturalWidth
  canvas.height = sourceImg.naturalHeight

  ctx.drawImage(sourceImg, 0, 0)
  var sourceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  var sourceWidth  = sourceImg.naturalWidth
  var sourceHeight = sourceImg.naturalHeight

  var destRatio   = destWidth / destHeight
  var sourceRatio = sourceWidth / sourceHeight

  if (destRatio > sourceRatio) {
    sourceHeight = sourceWidth / destRatio
  }
  else {
    sourceWidth = sourceHeight * destRatio
  }

  var sourceX = options.sourceX || (sourceImg.naturalWidth  - sourceWidth)  / 2 >> 0
  var sourceY = options.sourceY || (sourceImg.naturalHeight - sourceHeight) / 2 >> 0

  var processedImageData = downsample(sourceImageData, destWidth, destHeight,
    sourceX, sourceY, sourceWidth, sourceHeight)

  canvas.width  = processedImageData.width
  canvas.height = processedImageData.height

  ctx.putImageData(processedImageData, 0, 0)

  var destDataURL = canvas.toDataURL('image/jpeg', options.quality || .85)

  return Promise.resolve(destDataURL)
}

if (!downscale.canvas && !downscale.ctx) {
  downscale.canvas = document.createElement('canvas')
  downscale.ctx    = downscale.canvas.getContext("2d")
}
