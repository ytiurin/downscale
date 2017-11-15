var sizes = [
  [70, 70],
  [210, 140],
  [360, 240],
  [540, 0]
]

function sequence()
{
  var resolveSeq
  var resArray = []
  var steps = arguments
  var stepN = 0

  var callNextStep = function() {
    steps[stepN++](next, finish)
    if (stepN === steps.length) {
      stepN = 0
    }
  }
  var next = function(result) {
    resArray.push(result)
    callNextStep()
  }
  var finish = function(result) {
    if (result !== undefined) {
      resArray.push(result)
    }
    resolveSeq(resArray)
  }
  callNextStep()

  return new Promise(function(resolve, reject) {
    resolveSeq = resolve
  })
}

function appendTableRow()
{
  var tr = document.createElement('tr')
  var cell, i = 0
  while(cell = arguments[i++]) {
    var td = document.createElement('td')
    var content = cell.content ? cell.content : cell
    if (typeof content === 'string') {
      td.innerHTML = content
    }
    else {
      td.appendChild(content)
    }
    if (cell.align) {
      td.align = cell.align
    }
    if (cell.colspan) {
      td.colSpan = cell.colspan
    }
    tr.appendChild(td)
  }
  tbody.appendChild(tr)
}

function canvasResizeFile(file, WIDTH, HEIGHT)
{
  var cacheInd = fileCache.indexOf(file)
  if (~cacheInd) {
    return canvasResizeImg(imgCache[cacheInd], WIDTH, HEIGHT)
  }

  var sourceImg = document.createElement("img")

  return new Promise(function(resolve) {
    sourceImg.onload = function() {
      fileCache.push(file)
      imgCache.push(sourceImg)

      canvasResizeImg(sourceImg, WIDTH, HEIGHT).
      then(function(img) {
        resolve(img)
      })
    }
    sourceImg.src = URL.createObjectURL(file)
  })
}

function canvasResizeImg(img, destWidth, destHeight)
{
  var sourceWidth  = img.naturalWidth
  var sourceHeight = img.naturalHeight

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

  canvas.width  = destWidth
  canvas.height = destHeight

  ctx.imageSmoothingQuality       = "high"
  ctx.mozImageSmoothingEnabled    = canvasSmoothingEnabled
  ctx.webkitImageSmoothingEnabled = canvasSmoothingEnabled
  ctx.msImageSmoothingEnabled     = canvasSmoothingEnabled
  ctx.imageSmoothingEnabled       = canvasSmoothingEnabled
  ctx.drawImage(img,
    sourceX, sourceY, sourceWidth, sourceHeight,
    0, 0, destWidth, destHeight)

  var canvImg = document.createElement("img")
  return new Promise(function(resolve) {
    canvImg.onload = function() {
      resolve(canvImg)
    }
    canvImg.src = canvas.toDataURL(`image/jpeg`, .85)
  })
}

function resize(source, WIDTH, HEIGHT, cached)
{
  var canvTime, libTime
  var canvasResize = source instanceof File ? canvasResizeFile : canvasResizeImg

  return sequence(
  function(next, finish) {
    var start = new Date
    canvasResize(source, WIDTH, HEIGHT).
    then(function(r) {
      canvTime = (new Date) - start
      next(r)
    })
  },
  function(next, finish) {
    var start = new Date
    downscale(source, WIDTH, HEIGHT).
    then(function(r) {
      libTime = (new Date) - start
      finish(r)
    })
  }).
  then(function(a) {
    var canvImage = a[0]
    var libImage = document.createElement('img')
    libImage.src = a[1]

    var title = HEIGHT > 0 ? `${WIDTH}x${HEIGHT} (px)` : `Width ${WIDTH}px`

    appendTableRow("&nbsp;", "&nbsp;")
    appendTableRow(title, title)
    appendTableRow(canvImage, libImage)
    appendTableRow(`${canvTime}ms`, `${libTime}ms (${cached ? "cached image data" : "init cache"})`)

    return {canvTime: canvTime, libTime: libTime}
  })
}

function addSource(source)
{
  if (source.name) {
    appendTableRow("&nbsp;", "&nbsp;")
    appendTableRow({colspan: 2, content: source.name})
  }

  var n = 0
  return sequence(function(next, finish) {
    if (!sizes[n]) {
      finish()
      return
    }
    resize(source, sizes[n][0], sizes[n][1], n > 0).
    then(function(res) {
      n++
      next(res)
    })
  }).
  then(function(times) {
    var totalTimes = times.reduce(function(r, a) {
      r.canvTime += a.canvTime
      r.libTime  += a.libTime
      return r
    }, {canvTime: 0, libTime: 0})

    appendTableRow("<hr>", "<hr>")
    appendTableRow(`<b>Total</b>: ${totalTimes.canvTime}ms`, `<b>Total</b>: ${totalTimes.libTime}ms`)
    appendTableRow("&nbsp;", "&nbsp;")
  })
}

function filesChanged(files)
{
  if (!files.length) {
    return
  }
  tbody.innerHTML = ""
  if (files.length > 1) {
    progress.max = files.length
    progress.style.display  = "inline"
    fileInput.style.display = "none"
  }

  var n = 0
  sequence(function(next, finish) {
    if (!files[n]) {
      progress.style.display  = "none"
      fileInput.style.display = "inline"
      finish()
      return
    }
    addSource(files[n++]).
    then(function() {
      progress.value = n
      next()
    })
  })
}

function canvasSmoothingChanged(enabled)
{
  canvasSmoothingEnabled = enabled
  tbody.innerHTML = ""

  var input = document.getElementsByTagName("input")[0]
  if (input.files.length) {
    input.onchange()
  }
  else {
    img.src = "../public/1.jpg"
  }
}

var img = document.createElement('img')
var canvas = document.createElement('canvas')
var ctx = canvas.getContext("2d")
var tbody = document.getElementsByTagName('tbody')[0]
var fileInput = document.getElementsByTagName('input')[0]
var progress = document.getElementsByTagName('progress')[0]
var fileCache = []
var imgCache = []
var canvasSmoothingEnabled = !1

img.addEventListener("load", function() {
  addSource(this).
  then(function() {
    progress.style.display  = "none"
    fileInput.style.display = "inline"
  })
})

img.src = "../public/1.jpg"

fileInput.style.display = "none"
