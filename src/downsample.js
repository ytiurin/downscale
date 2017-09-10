function round(val)
{
  return (val + 0.5) << 0
}

function downsample(sourceImageData, destWidth, destHeight, sourceX, sourceY,
  sourceWidth, sourceHeight)
{
  var dest = new ImageData(destWidth, destHeight)

  var SOURCE_DATA  = new Int32Array(sourceImageData.data.buffer)
  var SOURCE_WIDTH = sourceImageData.width

  var DEST_DATA  = new Int32Array(dest.data.buffer)
  var DEST_WIDTH = dest.width

  var SCALE_FACTOR_X  = destWidth  / sourceWidth
  var SCALE_FACTOR_Y  = destHeight / sourceHeight
  var SCALE_RANGE_X   = round(1 / SCALE_FACTOR_X)
  var SCALE_RANGE_Y   = round(1 / SCALE_FACTOR_Y)
  var SCALE_RANGE_SQR = SCALE_RANGE_X * SCALE_RANGE_Y

  for (var destRow = 0; destRow < dest.height; destRow++) {
    for (var destCol = 0; destCol < DEST_WIDTH; destCol++) {

      var sourceInd = sourceX + round(destCol / SCALE_FACTOR_X) +
        (sourceY + round(destRow / SCALE_FACTOR_Y)) * SOURCE_WIDTH

      var destRed   = 0
      var destGreen = 0
      var destBlue  = 0
      var destAlpha = 0

      for (var sourceRow = 0; sourceRow < SCALE_RANGE_Y; sourceRow++)
        for (var sourceCol = 0; sourceCol < SCALE_RANGE_X; sourceCol++) {
          var sourcePx = SOURCE_DATA[sourceInd + sourceCol + sourceRow * SOURCE_WIDTH]
          destRed   += sourcePx <<  24 >>> 24
          destGreen += sourcePx <<  16 >>> 24
          destBlue  += sourcePx <<  8  >>> 24
          destAlpha += sourcePx >>> 24
        }

      destRed   = round(destRed   / SCALE_RANGE_SQR)
      destGreen = round(destGreen / SCALE_RANGE_SQR)
      destBlue  = round(destBlue  / SCALE_RANGE_SQR)
      destAlpha = round(destAlpha / SCALE_RANGE_SQR)

      DEST_DATA[destCol + destRow * DEST_WIDTH] =
        (destAlpha << 24) |
        (destBlue  << 16) |
        (destGreen << 8)  |
        (destRed)
    }
  }

  return dest
}
