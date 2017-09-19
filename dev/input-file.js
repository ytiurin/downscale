function fileChanged(input)
{
  for (var i = 0; i < input.files.length; i++) {
    downscale(input.files[i], 400, 400)

    .then(function(dataURL) {
      var destImg = document.createElement('img')
      destImg.src = dataURL
      document.body.appendChild(destImg)
    })
  }
}
