(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.downscale = factory();
    }
}(this, function () {

  function round(val)
  {
    return (val + 0.5) << 0
  }

  function downscale( source, scaleFactor )
  {
    scaleFactor = scaleFactor < 1 ? scaleFactor : 1

    var dest = new ImageData(
      round(source.width  * scaleFactor),
      round(source.height * scaleFactor))

    var SOURCE_DATA  = new Int32Array(source.data.buffer)
    var SOURCE_WIDTH = source.width

    var DEST_DATA = new Int32Array(dest.data.buffer)
    var DEST_WIDTH = dest.width

    var SCALE_RANGE  = round(1 / scaleFactor)
    var SCALE_RANGE_SQR = SCALE_RANGE * SCALE_RANGE

    for (var destRow = 0; destRow < dest.height; destRow++) {
      for (var destCol = 0; destCol < DEST_WIDTH; destCol++) {

        var sourceInd = round(destCol / scaleFactor) + round(destRow / scaleFactor) * SOURCE_WIDTH

        var destRed   = 0
        var destGreen = 0
        var destBlue  = 0
        var destAlpha = 0

        for (var sourceRow = 0; sourceRow < SCALE_RANGE; sourceRow++)
          for (var sourceCol = 0; sourceCol < SCALE_RANGE; sourceCol++) {
            var sourcePx = SOURCE_DATA[sourceInd + sourceCol + sourceRow * SOURCE_WIDTH]
            destRed   += sourcePx <<  24 >>> 24
            destGreen += sourcePx <<  16 >>> 24
            destBlue  += sourcePx <<  8 >>> 24
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

  return downscale
}));
