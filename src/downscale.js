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
