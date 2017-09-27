function filesChanged(files)
{
  for (var i = 0; i < files.length; i++) {
    downscale(files[i], 400, 400, {debug: 1},
    function(dataURL) {
      var destInput = document.createElement("input");
      destInput.type = "hidden";
      destInput.name = "image[]";
      destInput.value = dataURL;
      // Append image to form as hidden input
      document.forms[0].appendChild(destInput);
      // Preview image
      var destImg = document.createElement("img");
      destImg.src = dataURL;
      document.body.appendChild(destImg);
    })
  }
}
