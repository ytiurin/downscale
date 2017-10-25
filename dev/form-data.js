var formData = new FormData();
var button = document.getElementsByTagName("button")[0]
var URL = window.URL || window.webkitURL;

function submitForm()
{
  var request = new XMLHttpRequest();
  request.open("POST", "http://foo.com/submitform.php");
  request.send(formData);
}

function filesChanged(files)
{
  var promises = []
  for (let i = 0; i < files.length; i++) {
    promises.push(
      downscale(files[i], 400, 400, {debug: 1, returnBlob: 1}).
      then(function(blob) {
        formData.append("userpic[]", blob, files[i].name);
        // Preview image
        var destImg = document.createElement("img");
        destImg.src = URL.createObjectURL(blob);
        document.getElementById("previews").appendChild(destImg);
      }))
  }
  Promise.all(promises).
  then(function() {
    button.disabled = false
  })
}

button.disabled = true
