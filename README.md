Better image downscale using canvas
===================================
This function is effective when downscaling large images using canvas, neutralising the "fuzzy" effect.

Syntax
------
```javascript
Promise<DOMString> downscale(source, width, height[, options]);
```

### Parameters
<dl>
  <dt><strong>source</strong></dt>
  <dd>Defines the source of the image data to downscale. This can either be:
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

  <dt><strong>width</strong></dt>
  <dd>The width of the resulting image.</dd>

  <dt><strong>height</strong></dt>
  <dd>The height of the resulting image.</dd>
</dl>

### Return value
A [```Promise```](https://developer.mozilla.org/en-US/docs/Web/API/Promise "The Promise interface represents a proxy for a value not necessarily known at its creation time. It allows you to associate handlers to an asynchronous action's eventual success or failure. This lets asynchronous methods return values like synchronous methods: instead of the final value, the asynchronous method returns a promise of having a value at some point in the future.") that resolves to a [```DOMString```](https://developer.mozilla.org/en-US/docs/Web/API/DOMString "DOMString is a UTF-16 String. As JavaScript already uses such strings, DOMString is mapped directly to a String.") containing the resulting image in [data URI](https://developer.mozilla.org/en-US/docs/Web/HTTP/data_URIs "URLs prefixed with the data: scheme, allow content creators to embed small files inline in documents.") format.
