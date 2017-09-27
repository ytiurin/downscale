
Better image downscale with canvas
===================================
This function downscales images in the browser, producing a better quality result, than the traditional [`CanvasRenderingContext2D.scale()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/scale "The CanvasRenderingContext2D.scale() method of the Canvas 2D API adds a scaling transformation to the canvas units by x horizontally and by y vertically.") method. It neutralises the "fuzzy" look caused by the native canvas downsampling, when processing relatively large images such as photos taken with a smartphone.

![Better image downscale demo](https://github.com/ytiurin/downscale/raw/master/public/demo.jpg)

Motivation
----------
While other image resizing libraries are based on complex interpolation algorithms such as [Lanczos resampling](https://en.wikipedia.org/wiki/Lanczos_resampling "Lanczos resampling and Lanczos filtering are two applications of a mathematical formula. It can be used as a low-pass filter or used to smoothly interpolate the value of a digital signal between its samples."), image downscaling usually doesn't require that complexity, because there is no interpolation happening (in other words we don't create new pixels).

On the other hand, browsers implement very fast [`HTMLCanvasElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement "The HTMLCanvasElement interface provides properties and methods for manipulating the layout and presentation of canvas elements.") downsampling, when the pixel from source position is directly transfered to the destination position, loosing all the neighbouring pixels information. The resulting image may often look very noisy.

To resolve this problem, the proposed function does simple average downsampling, producing preferable results with relatively small processing time.

Performance
-----------
This function uses the technique, proposed by [Paul Rouget](http://paulrouget.com/) in his [article](https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/ "Faster Canvas Pixel Manipulation with Typed Arrays") about pixel manipulation with [Typed Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays "JavaScript typed arrays are array-like objects and provide a mechanism for accessing raw binary data."). His method reduces the number of read/write operations to the [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer "The ArrayBuffer object is used to represent a generic, fixed-length raw binary data buffer. You cannot directly manipulate the contents of an ArrayBuffer; instead, you create one of the typed array objects or a DataView object which represents the buffer in a specific format, and use that to read and write the contents of the buffer.") of the [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData "The ImageData interface represents the underlying pixel data of an area of a <canvas> element. It is created using the ImageData() constructor or creator methods on the CanvasRenderingContext2D object associated with a canvas: createImageData() and getImageData(). It can also be used to set a part of the canvas by using putImageData().") returned by the [`CanvasRenderingContext2D.getImageData()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData "The CanvasRenderingContext2D.getImageData() method of the Canvas 2D API returns an ImageData object representing the underlying pixel data for the area of the canvas denoted by the rectangle which starts at (sx, sy) and has an sw width and sh height. This method is not affected by the canvas transformation matrix.") method. This saves overall processing time when you want to iterate through every pixel of the source image.

Also, the usage of [`Math.round()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round "The Math.round() function returns the value of a number rounded to the nearest integer.") method is avoided in favour of [Bitwise operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators "Bitwise operators treat their operands as a sequence of 32 bits (zeroes and ones), rather than as decimal, hexadecimal, or octal numbers. For example, the decimal number nine has a binary representation of 1001. Bitwise operators perform their operations on such binary representations, but they return standard JavaScript numerical values."), giving a significant boost in performance in some browsers.

Image cropping
--------------
Image cropping is very often used in pair with resizing, but both can be very naturally combined. As we don't need to iterate through pixels in cropped areas, the function does both downscaling and cropping in range of the same processing loop. This saves some memory and processing time.

By default, the source image is cropped in the way, that the center of the source image is transfered to the resulting image.

Install
-------
```
npm install downscale
```

Syntax
------
```javascript
Promise<DOMString> downscale(source, width, height[, options]);
```

### Parameters
<dl>
  <dt>source</dt>
  <dd>
    Defines the source of the image data to downscale. This can either be:
    <ul>
      <li>
        A <a href="https://developer.mozilla.org/en-US/docs/Web/API/File" title="The File interface provides information about files and allows JavaScript in a web page to access their content."><code>File</code></a> object, contained by the <a href="https://developer.mozilla.org/en-US/docs/Web/API/FileList" title="An object of this type is returned by the files property of the HTML <input> element; this lets you access the list of files selected with the <input type=&quot;file&quot;> element. It's also used for a list of files dropped into web content when using the drag and drop API; see the DataTransfer object for details on this usage."><code>FileList</code></a>, returned by the <code><a href="/en-US/docs/Web/API/HTMLInputElement#files_prop" title="The HTMLInputElement interface provides special properties and methods for manipulating the layout and presentation of input elements.">HTMLInputElement.files</a></code> property.
      </li>
      <li>
        A <code><a title="The HTMLVideoElement interface provides special properties and methods for manipulating video objects. It also inherits properties and methods of HTMLMediaElement and HTMLElement." href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement">HTMLImageElement</a></code> with the <code><a title="The image URL. This attribute is mandatory for the <img> element." href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-src">src</a></code> HTML attribute, containing the full URL to the source image.
      </li>
      <li>
        A <a title="The HTMLVideoElement interface provides special properties and methods for manipulating video objects. It also inherits properties and methods of HTMLMediaElement and HTMLElement." href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement"><code>HTMLVideoElement</code></a> in any state.
      </li>
      <li>
        A <a title="DOMString is a UTF-16 String. As JavaScript already uses such strings, DOMString is mapped directly to a String." href="https://developer.mozilla.org/en-US/docs/Web/API/DOMString"><code>DOMString</code></a> representing the URL to the source image.
      </li>
    </ul>
  </dd>

  <dt>width</dt>
  <dd>A <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number" title="The Number JavaScript object is a wrapper object allowing you to work with numerical values. A Number object is created using the Number() constructor."><code>Number</code></a> indicating width of the resulting image.</dd>

  <dt>height</dt>
  <dd>A <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number" title="The Number JavaScript object is a wrapper object allowing you to work with numerical values. A Number object is created using the Number() constructor."><code>Number</code></a> indicating height of the resulting image.</dd>

  <dt>options <sup>(optional)</sup></dt>
  <dd>
    An object with properties representing optional function parameters:
    <ul>
      <li>
        <dl>
          <dt>imageType</dt>
          <dd>A <a title="DOMString is a UTF-16 String. As JavaScript already uses such strings, DOMString is mapped directly to a String." href="https://developer.mozilla.org/en-US/docs/Web/API/DOMString"><code>DOMString</code></a> indicating image format. Possible values are <code>jpeg</code>, <code>png</code>, <code>webp</code>. The default format type is <code>jpeg</code>.</dd>
        </dl>
      </li>
      <li>
        <dl>
          <dt>quality</dt>
          <dd>A <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number" title="The Number JavaScript object is a wrapper object allowing you to work with numerical values. A Number object is created using the Number() constructor."><code>Number</code></a> between <code>0</code> and <code>1</code> indicating image quality if the requested <code>imageType</code> is <code>jpeg</code> or <code>webp</code>. The default value is <code>0.85</code>.</dd>
        </dl>
      </li>
      <li>
        <dl>
          <dt>returnCanvas</dt>
          <dd>A <a title="The Boolean object is an object wrapper for a boolean value." href="/en-US/docs/Web/API/Boolean"><code>Boolean</code></a> indicating if the returned <a href="https://developer.mozilla.org/en-US/docs/Web/API/Promise" title="The Promise interface represents a proxy for a value not necessarily known at its creation time. It allows you to associate handlers to an asynchronous action's eventual success or failure. This lets asynchronous methods return values like synchronous methods: instead of the final value, the asynchronous method returns a promise of having a value at some point in the future."><code>Promise</code></a> should resolve with <a title="The HTMLCanvasElement interface provides properties and methods for manipulating the layout and presentation of canvas elements. The HTMLCanvasElement interface also inherits the properties and methods of the HTMLElement interface." href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement"><code>HTMLCanvasElement</code></a> containing the resulting image. The default value is <code>false</code>.</dd>
        </dl>
      </li>
      <li>
        <dl>
          <dt>sourceX</dt>
          <dd>A <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number" title="The Number JavaScript object is a wrapper object allowing you to work with numerical values. A Number object is created using the Number() constructor."><code>Number</code></a> indicating distance from the left side of the source image to draw into the destination context. This allows to crop the source image from the left side. The default value is calculated to centralize the destination rectangle relatively to the source canvas.</dd>
        </dl>
      </li>
      <li>
        <dl>
          <dt>sourceY</dt>
          <dd>A <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number" title="The Number JavaScript object is a wrapper object allowing you to work with numerical values. A Number object is created using the Number() constructor."><code>Number</code></a> indicating distance from the top side of the source image to draw into the destination context. This allows to crop the source image from the top side. The default value is calculated to centralize the destination rectangle relatively to the source canvas.</dd>
        </dl>
      </li>
    </ul>
  </dd>
</dl>

### Return value
A [`Promise`](https://developer.mozilla.org/en-US/docs/Web/API/Promise "The Promise interface represents a proxy for a value not necessarily known at its creation time. It allows you to associate handlers to an asynchronous action's eventual success or failure. This lets asynchronous methods return values like synchronous methods: instead of the final value, the asynchronous method returns a promise of having a value at some point in the future.") that resolves to a [`DOMString`](https://developer.mozilla.org/en-US/docs/Web/API/DOMString "DOMString is a UTF-16 String. As JavaScript already uses such strings, DOMString is mapped directly to a String.") containing the resulting image in [data URI](https://developer.mozilla.org/en-US/docs/Web/HTTP/data_URIs "URLs prefixed with the data: scheme, allow content creators to embed small files inline in documents.") format.

Examples
--------
### Using file input
This is just a simple code snippet which uses the form file input as a source of the image data.
#### HTML
```html
<input type="file" accept="image/*" onchange="filesChanged(this.files)" multiple />
<form method="post"><input type="submit"/></form>
```
#### Javascript
```javascript
function filesChanged(files)
{
  for (var i = 0; i < files.length; i++) {
    downscale(files[i], 400, 400).
    then(function(dataURL) {
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
```

### Working with `<img>`
Processing an `<img>` element is quite simple. The function will wait for image load, so you don't have to worry about it.
#### HTML
```html
<img id="source" src="../public/1.jpg" />
```
#### Javascript
```javascript
var sourceImg = document.getElementById('source');

downscale(sourceImg, 400, 400).
then(function(dataURL) {
  var destImg = document.createElement('img');
  destImg.src = dataURL;
  document.body.appendChild(destImg);
})
```

### Using URL string
The function can upload the source image from the given URL with no extra code needed. Keep in mind that the image should share [origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin "The Origin request header indicates where a fetch originates from. It doesn't include any path information, but only the server name. It is sent with CORS requests, as well as with POST requests. It is similar to the Referer header, but, unlike this header, it doesn't disclose the whole path.") with the code file.
```javascript
var imageURL = "/public/1.jpg";

downscale(imageURL, 400, 400).
then(function(dataURL) {
  var destImg = document.createElement('img');
  destImg.src = dataURL;
  document.body.appendChild(destImg);
})
```

Other libraries
---------------
Check out other great in-browser image resizing libraries:
- [pica](https://github.com/nodeca/pica "Resize image in browser with high quality and high speed.") is great image resizing tool with support of [WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API "Web Workers makes it possible to run a script operation in background thread separate from the main execution thread of a web application. The advantage of this is that laborious processing can be performed in a separate thread, allowing the main (usually the UI) thread to run without being blocked/slowed down.") and [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly "WebAssembly is a new type of code that can be run in modern web browsers — it is a low-level assembly-like language with a compact binary format that runs with near-native performance and provides languages such as C/C++ with a compilation target so that they can run on the web. It is also designed to run alongside JavaScript, allowing both to work together.") from the box
- [Hermite-resize](https://github.com/viliusle/Hermite-resize "Canvas image resize/resample using Hermite filter with JavaScript.") does image resize/resample using Hermite filter and [WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API "Web Workers makes it possible to run a script operation in background thread separate from the main execution thread of a web application. The advantage of this is that laborious processing can be performed in a separate thread, allowing the main (usually the UI) thread to run without being blocked/slowed down.")

License
-------
MIT
