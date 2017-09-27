function createTiming(enabled, source, destWidth, destHeight)
{
  var start  = new Date
  var timing = {}
  var prev   = start
  var n      = "01"

  return {
    mark: enabled ? function(name) {
      name = `${n}. ${name || "..."}`
      timing[name] = { "time (ms)": (new Date) - prev }
      prev = new Date
      n = `0${(n >> 0) + 1}`.substr(-2)
    } : new Function,
    finish: enabled ? function() {
      timing[`${n}. TOTAL`] = { "time (ms)": (new Date) - start }
      console.log("IMAGE SOURCE:", source)
      console.log("DOWNSCALE TO:", `${destWidth}x${destHeight}`)
      console.table(timing)
    } : new Function
  }
}

function performCanvasDownscale(source, sourceWidth, sourceHeight, destWidth,
  destHeight, options, timing)
{
  if (!performCanvasDownscale.canvas) {
    performCanvasDownscale.canvas = document.createElement('canvas')
  }

  var canvas = performCanvasDownscale.canvas
  var ctx    = canvas.getContext("2d")

  canvas.width  = sourceWidth
  canvas.height = sourceHeight

  timing.mark()
  ctx.drawImage(source, 0, 0)
  timing.mark("DRAW IMAGE ON CANVAS")

  timing.mark()
  var sourceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  timing.mark("GET IMAGE DATA")

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

  timing.mark()
  var processedImageData = downsample(sourceImageData, destWidth, destHeight,
    sourceX, sourceY, sourceWidth, sourceHeight)
  timing.mark("DOWNSAMPLE")

  canvas.width  = processedImageData.width
  canvas.height = processedImageData.height

  timing.mark()
  ctx.putImageData(processedImageData, 0, 0)
  timing.mark("PUT IMAGE DATA")

  if (options.returnCanvas) {
    return canvas
  }
  timing.mark()
  var dataURL = canvas.toDataURL(`image/${options.imageType || "jpeg"}`,
    options.quality || .85)
  timing.mark("PRODUCE DATA URL")

  return dataURL
}

function waitArrayBufferLoad(source, afterBufferLoad)
{
  var xhr = new XMLHttpRequest

  xhr.open("GET", source)
  xhr.responseType = "arraybuffer"

  xhr.addEventListener("load", function() {
    afterBufferLoad(this.response)
  })

  xhr.send()
}

function waitImgLoad(img, afterImageLoaded)
{
  if (img.complete) {
    afterImageLoaded()
  }
  else {
    img.addEventListener("load", afterImageLoaded)
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

function downscale(source, destWidth, destHeight, options, onComplete)
{
  var timing = createTiming(options && options.debug || false,
    source, destWidth, destHeight)

  var err = validateArguments(arguments)
  if (err instanceof TypeError) {
    return Promise.reject(err)
  }

  if (options instanceof Function) {
    onComplete = options
    options    = {}
  }
  options    = options    || {}
  onComplete = onComplete || new Function

  var URL = window.URL || window.webkitURL

  return new Promise(function(resolve, reject) {
    function resolveDownscale(source, sourceWidth, sourceHeight) {
      var result = performCanvasDownscale(source, sourceWidth, sourceHeight,
        destWidth, destHeight, options, timing)

      onComplete(result)
      resolve(result)

      timing.mark("RESOLVE")
      timing.finish()
    }

    switch (detectSourceType(source)) {

      case "File":
        var sourceImg = document.createElement("img")
        timing.mark()
        sourceImg.src = URL.createObjectURL(source)
        timing.mark("READ FILE")
        waitImgLoad(sourceImg, function() {
          timing.mark("LOAD IMAGE")
          resolveDownscale(sourceImg, sourceImg.naturalWidth,
            sourceImg.naturalHeight)
        })
        break

      case "HTMLImageElement":
        timing.mark()
        waitImgLoad(source, function() {
          timing.mark("LOAD IMAGE")
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
        timing.mark()
        waitArrayBufferLoad(source, function(arrayBuffer) {
          timing.mark("LOAD ARRAY BUFFER")
          var arrayBufferView = new Uint8Array(arrayBuffer)
          var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } )
          var sourceImg = document.createElement("img")
          sourceImg.src = URL.createObjectURL(blob)
          timing.mark()
          waitImgLoad(sourceImg, function() {
            timing.mark("LOAD IMAGE")
            resolveDownscale(sourceImg, sourceImg.naturalWidth,
              sourceImg.naturalHeight)
          })
        })
        break
    }
  })
}
