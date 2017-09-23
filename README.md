
Better image downscale with canvas
===================================
This function downscales images in the browser, producing a better quality result, than the traditional [`CanvasRenderingContext2D.scale()`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/scale "The CanvasRenderingContext2D.scale() method of the Canvas 2D API adds a scaling transformation to the canvas units by x horizontally and by y vertically.") method. It neutralises the "fuzzy" look caused by the native canvas downsampling, when processing relatively large images such as photos taken with a smartphone.

![Better image downscale demo](https://github.com/ytiurin/downscale/raw/master/public/demo.jpg)

Motivation
----------
While other image resizing libraries are based on complex interpolation algorithms such as [Lanczos resampling](https://en.wikipedia.org/wiki/Lanczos_resampling "Lanczos resampling and Lanczos filtering are two applications of a mathematical formula. It can be used as a low-pass filter or used to smoothly interpolate the value of a digital signal between its samples."), image downscaling usually doesn't require that complexity, because there is no interpolation happening (in other words we don't create new pixels).

On the other hand, browsers implement very fast [`HTMLCanvasElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement "The HTMLCanvasElement interface provides properties and methods for manipulating the layout and presentation of canvas elements.") downsampling, when the pixel from source position is directly transfered to the destination position, loosing all the neighbouring pixels information. The resulting image may often look very noisy.

To resolve this problem, the proposed method implements a simple [linear downsampling](https://en.wikipedia.org/wiki/Decimation_(signal_processing) "In digital signal processing, decimation is the process of reducing the sampling rate of a signal.") algorithm, that produces preferable results with relatively small processing time.

Usage
-----
```javascript
downscale(sourceImg, 170, 170).
then(function(dataURL) {
  var previewImg = document.createElement('img')
  previewImg.src = dataURL
  document.body.appendChild(previewImg)
})
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
