(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.downscale = factory();
    }
}(this, function () {

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
function performImageDownscale(img, destWidth, destHeight, options)
{
  if (!performImageDownscale.canvas) {
    performImageDownscale.canvas = document.createElement('canvas')
  }

  var canvas = performImageDownscale.canvas
  var ctx    = canvas.getContext("2d")

  canvas.width  = img.naturalWidth
  canvas.height = img.naturalHeight

  ctx.drawImage(img, 0, 0)
  var sourceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  var sourceWidth  = img.naturalWidth
  var sourceHeight = img.naturalHeight

  var destRatio   = destWidth / destHeight
  var sourceRatio = sourceWidth / sourceHeight

  if (destRatio > sourceRatio) {
    sourceHeight = sourceWidth / destRatio
  }
  else {
    sourceWidth = sourceHeight * destRatio
  }

  var sourceX = options.sourceX || (img.naturalWidth  - sourceWidth)  / 2 >> 0
  var sourceY = options.sourceY || (img.naturalHeight - sourceHeight) / 2 >> 0

  var processedImageData = downsample(sourceImageData, destWidth, destHeight,
    sourceX, sourceY, sourceWidth, sourceHeight)

  canvas.width  = processedImageData.width
  canvas.height = processedImageData.height

  ctx.putImageData(processedImageData, 0, 0)

  return canvas.toDataURL('image/jpeg', options.quality || .85)
}

function downscale(source, destWidth, destHeight, options)
{
  function downscaleResolve(sourceImg, resolve)
  {
    if (sourceImg.complete) {
      resolve(performImageDownscale(sourceImg, destWidth, destHeight, options))
    }
    else {
      sourceImg.onload = function(e) {
        resolve(performImageDownscale(this, destWidth, destHeight, options))
      }
    }
  }

  options = options || {}
  var URL = window.URL || window.webkitURL

  if (source instanceof File) {
    return new Promise(function(resolve, reject) {
      var sourceImg = document.createElement("img")
      sourceImg.src = URL.createObjectURL(source)
      downscaleResolve(sourceImg, resolve)
    })
  }

  if (typeof source === "string") {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest

      xhr.open("GET", source)
      xhr.responseType = "arraybuffer"

      xhr.onload = function() {
        var arrayBufferView = new Uint8Array( this.response )
        var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } )
        var sourceImg = document.createElement("img")
        sourceImg.src = URL.createObjectURL(blob)
        downscaleResolve(sourceImg, resolve)
      }

      xhr.send()
    })
  }

  if (source instanceof HTMLImageElement) {
    return new Promise(function(resolve, reject) {
      downscaleResolve(source, resolve)
    })
  }
}
    return downscale
}));