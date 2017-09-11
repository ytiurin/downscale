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
