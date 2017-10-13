function resizeWithCanvas(canvas, source, destWidth, destHeight, sourceX,
  sourceY, sourceWidth, sourceHeight)
{
  var canvas = document.createElement("canvas")
  canvas.width  = destWidth
  canvas.height = destHeight

  var scaleFactorX = destWidth  / sourceWidth
  var scaleFactorY = destHeight / sourceHeight

  var ctx = canvas.getContext("2d")
  ctx.scale( scaleFactorX, scaleFactorY )
  ctx.drawImage(source, 0, 0)
  ctx.scale(1, 1)

  return canvas
}
