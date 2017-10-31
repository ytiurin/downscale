function resizeWithCanvas(canvas, source, destWidth, destHeight, sourceX,
  sourceY, sourceWidth, sourceHeight)
{
  var canvas = document.createElement("canvas")

  canvas.width  = destWidth
  canvas.height = destHeight

  var ctx = canvas.getContext("2d")

  ctx.mozImageSmoothingEnabled    = true
  ctx.imageSmoothingQuality       = "high"
  ctx.webkitImageSmoothingEnabled = true
  ctx.msImageSmoothingEnabled     = true
  ctx.imageSmoothingEnabled       = true

  ctx.drawImage(source,
    sourceX, sourceY, sourceWidth, sourceHeight,
    0, 0, destWidth, destHeight)

  return canvas
}
