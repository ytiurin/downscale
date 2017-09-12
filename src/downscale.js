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

  if (options.returnCanvas) {
    return canvas
  }
  return canvas.toDataURL(`image/${options.imageType || "jpeg"}`,
    options.quality || .85)
}

function detectSourceType(source)
{
  if (source instanceof File) {
    return "File"
  }
  if (typeof source === "string") {
    return "URL"
  }
  if (source instanceof HTMLImageElement) {
    return "HTMLImageElement"
  }
}

function validateArguments(args)
{
  if (args.length < 3) {
    return new TypeError(`3 arguments required, but only ${args.length} present.`)
  }
  if (!detectSourceType(args[0])) {
    return new TypeError("First argument should be HTMLImageElement, File of String")
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

  var err = validateArguments(arguments)
  if (err instanceof TypeError) {
    return Promise.reject(err)
  }

  options = options || {}
  var URL = window.URL || window.webkitURL

  return new Promise(function(resolve, reject) {
    switch (detectSourceType(source)) {

      case "File":
        var sourceImg = document.createElement("img")
        sourceImg.src = URL.createObjectURL(source)
        downscaleResolve(sourceImg, resolve)
        break

      case "HTMLImageElement":
        downscaleResolve(source, resolve)
        break

      case "URL":
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
        break
    }
  })
}
