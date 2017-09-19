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
function performCanvasDownscale(source, sourceWidth, sourceHeight, destWidth,
  destHeight, options)
{
  if (!performCanvasDownscale.canvas) {
    performCanvasDownscale.canvas = document.createElement('canvas')
  }

  var canvas = performCanvasDownscale.canvas
  var ctx    = canvas.getContext("2d")

  canvas.width  = sourceWidth
  canvas.height = sourceHeight

  ctx.drawImage(source, 0, 0)
  var sourceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  var origSourceWidth  = sourceWidth
  var origSourceHeight = sourceHeight

  var destRatio   = destWidth / destHeight
  var sourceRatio = sourceWidth / sourceHeight

  if (destRatio > sourceRatio) {
    sourceHeight = sourceWidth / destRatio
  }
  else {
    sourceWidth = sourceHeight * destRatio
  }

  var sourceX = options.sourceX || (origSourceWidth  - sourceWidth)  / 2 >> 0
  var sourceY = options.sourceY || (origSourceHeight - sourceHeight) / 2 >> 0

  var processedImageData = downsample(sourceImageData, destWidth, destHeight,
    sourceX, sourceY, sourceWidth, sourceHeight)

  canvas.width  = processedImageData.width
  canvas.height = processedImageData.height

  ctx.putImageData(processedImageData, 0, 0)

  if (options.returnCanvas) {
    return canvas
  }
  return canvas.toDataURL(`image/${options.imageType || "jpeg"}`,
    options.quality || .85)
}

function waitArrayBufferLoad(source)
{
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest

    xhr.open("GET", source)
    xhr.responseType = "arraybuffer"

    xhr.addEventListener("load", function() {
      resolve(this.response)
    })

    xhr.send()
  })
}

function waitImgLoad(img)
{
  if (img.complete) {
    return Promise.resolve()
  }
  else {
    return new Promise(function(resolve, reject) {
      img.addEventListener("load", function() {
        resolve()
      })
    })
  }
}

function waitVideoLoad(video)
{
  if (video.readyState > 1) {
    return Promise.resolve()
  }
  else {
    return new Promise(function(resolve, reject) {
      video.addEventListener("loadeddata", function() {
        resolve()
      })
    })
  }
}

function detectSourceType(source)
{
  if (source instanceof File) {
    return "File"
  }
  if (source instanceof HTMLImageElement) {
    return "HTMLImageElement"
  }
  if (source instanceof HTMLVideoElement) {
    return "HTMLVideoElement"
  }
  if (typeof source === "string") {
    return "URL"
  }
}

function validateArguments(args)
{
  if (args.length < 3) {
    return new TypeError(`3 arguments required, but only ${args.length} present.`)
  }
  if (!detectSourceType(args[0])) {
    return new TypeError("First argument should be HTMLImageElement, HTMLVideoElement, File of String")
  }
  if (typeof args[1] !== "number") {
    return new TypeError("Second argument should be a number")
  }
  if (typeof args[2] !== "number") {
    return new TypeError("Third argument should be a number")
  }
}

function downscale(source, destWidth, destHeight, options)
{
  var err = validateArguments(arguments)
  if (err instanceof TypeError) {
    return Promise.reject(err)
  }

  options = options || {}
  var URL = window.URL || window.webkitURL

  return new Promise(function(resolve, reject) {
    function resolveDownscale(source, sourceWidth, sourceHeight) {
      resolve(
        performCanvasDownscale(source, sourceWidth, sourceHeight, destWidth,
          destHeight, options))
    }

    switch (detectSourceType(source)) {

      case "File":
        var sourceImg = document.createElement("img")
        sourceImg.src = URL.createObjectURL(source)
        waitImgLoad(sourceImg).
        then(function() {
          resolveDownscale(sourceImg, sourceImg.naturalWidth,
            sourceImg.naturalHeight)
        })
        break

      case "HTMLImageElement":
        waitImgLoad(source).
        then(function() {
          resolveDownscale(source, source.naturalWidth, source.naturalHeight)
        })
        break

      case "HTMLVideoElement":
        waitVideoLoad(source).
        then(function() {
          resolveDownscale(source, source.videoWidth, source.videoHeight)
        })
        break

      case "URL":
        waitArrayBufferLoad(source).
        then(function(arrayBuffer) {
          var arrayBufferView = new Uint8Array(arrayBuffer)
          var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } )
          var sourceImg = document.createElement("img")
          sourceImg.src = URL.createObjectURL(blob)
          waitImgLoad(sourceImg).
          then(function() {
            resolveDownscale(sourceImg, sourceImg.naturalWidth,
              sourceImg.naturalHeight)
          })
        })
        break
    }
  })
}
    return downscale
}));