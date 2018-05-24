function createTiming(enabled, source, destWidth, destHeight)
{
  var start  = new Date
  var timing = {}
  var prev   = start
  var n      = "01"

  return {
    mark: enabled ? function(name) {
      name = n + ". " + (name || "...")
      timing[name] = { "time (ms)": (new Date) - prev }
      prev = new Date
      n = ("0" + ((n >> 0) + 1)).substr(-2)
    } : new Function,
    finish: enabled ? function() {
      timing[n + " TOTAL"] = { "time (ms)": (new Date) - start }
      console.log("IMAGE SOURCE:", source)
      console.log("DOWNSCALE TO:", destWidth + "x" + destHeight)
      console.table(timing)
    } : new Function
  }
}

function createCache()
{
  var keys       = []
  var values     = []
  var subscribes = []
  var PENDING    = new Object

  return {
    createSetter: function(key) {
      if (this.get(key)) {
        return
      }
      var cacheInd = keys.push(key) - 1
      values.push(PENDING)
      subscribes.push([])

      return function(value) {
        values[cacheInd] = value
        subscribes[cacheInd] = subscribes[cacheInd].reduce(function(r, resolve) {
          resolve(value)
        }, [])
      }
    },
    get: function(key, resolve) {
      var cacheInd = keys.indexOf(key)
      if (!~cacheInd) {
        return
      }
      if (values[cacheInd] === PENDING) {
        subscribes[cacheInd].push(resolve)
        return
      }
      resolve(values[cacheInd])
    },
    has: function(key) {
      return !!~keys.indexOf(key)
    }
  }
}

function getImageData(canvas, img, sourceWidth, sourceHeight)
{
  canvas.width  = sourceWidth
  canvas.height = sourceHeight

  var ctx = canvas.getContext("2d")
  ctx.drawImage(img, 0, 0)

  return ctx.getImageData(0, 0, sourceWidth, sourceHeight)
}

function putImageData(canvas, imageData)
{
  canvas.width  = imageData.width
  canvas.height = imageData.height

  var ctx = canvas.getContext("2d")
  ctx.putImageData(imageData, 0, 0)

  return canvas
}

function remapDimensions(destWidth, destHeight, sourceX, sourceY, sourceWidth,
  sourceHeight)
{
  var origSourceWidth  = sourceWidth
  var origSourceHeight = sourceHeight

  var sourceRatio = sourceWidth / sourceHeight

  if (destWidth === 0) {
    destWidth = destHeight * sourceRatio >> 0
  }

  if (destHeight === 0) {
    destHeight = destWidth / sourceRatio >> 0
  }

  var destRatio   = destWidth / destHeight

  if (destRatio > sourceRatio) {
    sourceHeight = sourceWidth / destRatio >> 0
  }
  else {
    sourceWidth = sourceHeight * destRatio >> 0
  }

  var sourceX = sourceX || (origSourceWidth  - sourceWidth)  / 2 >> 0
  var sourceY = sourceY || (origSourceHeight - sourceHeight) / 2 >> 0

  return {
    destWidth    : destWidth,
    destHeight   : destHeight,
    sourceX      : sourceX,
    sourceY      : sourceY,
    sourceWidth  : sourceWidth,
    sourceHeight : sourceHeight
  }
}

function produceResult(canvas, options, callback)
{
  if (options.returnCanvas) {
    callback(canvas)
    return
  }

  if (options.returnBlob) {
    canvas.toBlob(callback, "image/" + (options.imageType || "jpeg"),
      options.quality || .85)
    return
  }

  var dataURL = canvas.toDataURL("image/" + (options.imageType || "jpeg"),
    options.quality || .85)

  callback(dataURL)
}

function loadArrayBuffer(source, callback)
{
  var xhr = new XMLHttpRequest

  xhr.open("GET", source)
  xhr.responseType = "arraybuffer"

  xhr.addEventListener("load", function() {
    callback(this.response)
  })

  xhr.send()
}

function loadImg(img, callback)
{
  if (img.complete) {
    callback()
  }
  else {
    img.addEventListener("load",  callback)
  }
}

function loadVideo(video, callback)
{
  if (video.readyState > 1) {
    callback()
  }
  else {
    video.addEventListener("loadeddata", callback)
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
    return new TypeError("3 arguments required, but only " + args.length + " present.")
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
  var timing = createTiming(options && options.debug || false,
    source, destWidth, destHeight)

  var err = validateArguments(arguments)
  if (err instanceof TypeError) {
    return Promise.reject(err)
  }

  options = options || {}

  var resolveResult, rejectResult
  var result = new Promise(function(resolve, reject) {
    resolveResult = resolve
    rejectResult  = reject
  })

  downscale.canvas = downscale.canvas || document.createElement("canvas")
  downscale.cache  = downscale.cache  || createCache()

  var canvas = downscale.canvas
  var cache  = downscale.cache

  if (cache.has(source)) {
    timing.mark()
    cache.get(source,
    function(cacheData) {
      timing.mark("PENDING CACHE")
      var img = cacheData[0]
      var imageData = cacheData[1]

      var dims = remapDimensions(destWidth, destHeight, options.sourceX,
        options.sourceY, imageData.width, imageData.height)

      if (dims.sourceWidth  / dims.destWidth  >= 2 &&
          dims.sourceHeight / dims.destHeight >= 2) {
        timing.mark()
        var destImageData = downsample(imageData, dims.destWidth,
          dims.destHeight, dims.sourceX, dims.sourceY, dims.sourceWidth,
          dims.sourceHeight)
        timing.mark("DOWNSCALE")

        canvas = putImageData(canvas, destImageData)
      }
      else {
        canvas = resizeWithCanvas(canvas, img, dims.destWidth,
          dims.destHeight, dims.sourceX, dims.sourceY, dims.sourceWidth,
          dims.sourceHeight)
        timing.mark("RESIZE WITH CANVAS")
      }

      produceResult(canvas, options,
      function(result) {
        timing.mark("PRODUCE RESULT")
        resolveResult(result)
        timing.finish()
      })
    })

    return result
  }

  if (detectSourceType(source) !== "HTMLVideoElement") {
    var setCache = cache.createSetter(source)
  }

  var scaleSourceResolve = function(source, width, height) {
    var dims = remapDimensions(destWidth, destHeight, options.sourceX,
      options.sourceY, width, height)

    if (dims.sourceWidth  / dims.destWidth  >= 2 &&
        dims.sourceHeight / dims.destHeight >= 2) {
      timing.mark()
      var imageData = getImageData(canvas, source, width, height)
      timing.mark("GET IMAGE DATA")

      var destImageData = downsample(imageData, dims.destWidth,
        dims.destHeight, dims.sourceX, dims.sourceY, dims.sourceWidth,
        dims.sourceHeight)
      timing.mark("DOWNSCALE")

      canvas = putImageData(canvas, destImageData)

      setCache && setCache([source, imageData])
    }
    else {
      canvas = resizeWithCanvas(canvas, source, dims.destWidth,
        dims.destHeight, dims.sourceX, dims.sourceY, dims.sourceWidth,
        dims.sourceHeight)
      timing.mark("RESIZE WITH CANVAS")
    }

    produceResult(canvas, options,
    function(result) {
      timing.mark("PRODUCE RESULT")
      resolveResult(result)
      timing.finish()
    })
  }

  var URL = window.URL || window.webkitURL

  switch (detectSourceType(source)) {

    case "File":
      var sourceImg = document.createElement("img")
      timing.mark()
      sourceImg.src = URL.createObjectURL(source)
      timing.mark("READ FILE")
      loadImg(sourceImg,
      function() {
        timing.mark("LOAD IMAGE")
        scaleSourceResolve(sourceImg, sourceImg.naturalWidth,
          sourceImg.naturalHeight)
      })
      break

    case "HTMLImageElement":
      timing.mark()
      loadImg(source,
      function() {
        timing.mark("LOAD IMAGE")
        scaleSourceResolve(source, source.naturalWidth, source.naturalHeight)
      })
      break

    case "HTMLVideoElement":
      loadVideo(source,
      function() {
        scaleSourceResolve(source, source.videoWidth, source.videoHeight)
      })
      break

    case "URL":
      timing.mark()
      setTimeout(function() {
      loadArrayBuffer(source,
      function(arrayBuffer) {
        timing.mark("LOAD ARRAY BUFFER")
        var arrayBufferView = new Uint8Array(arrayBuffer)
        var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } )
        var sourceImg = document.createElement("img")
        sourceImg.src = URL.createObjectURL(blob)
        timing.mark()
        loadImg(sourceImg,
        function() {
          timing.mark("LOAD IMAGE")
          scaleSourceResolve(sourceImg, sourceImg.naturalWidth,
            sourceImg.naturalHeight)
        })
      })
      })
      break
  }

  return result
}
