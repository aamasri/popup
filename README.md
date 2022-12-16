<h1>Popup</h1>

<p>A flexible javascript popup popup.</p>

<img src="https://auro.technology/uploads/auro/webpage/221/popup_thumb.png" width="400px" alt="">
<pre>
popup.open({
        title: 'Popup Title',
        source: 'Body content can be (HTML, CSS selector, DOM element, or URL)',
    }).then(...);
</pre>

<br>
<h2>Features</h2>
<ul>
    <li>Easy to use.</li>
    <li>Lazy loading (3kb initial page load).</li>
    <li>Usable as a webpack/ES6 module or a pre-built browser bundle.</li>
    <li>Handles multiple programming scenarios and content sources.</li>
    <li>Simple HTML structure and easy custom styling using CSS3 variables.</li>
    <li>Popups can be 'modal', and/or can be layered on top of each other.</li>
    <li>Implements the 'Promise' interface, allowing sequential notifications.</li> 
</ul>


<br><br>
<h2>Demo</h2>
<a href="https://auro.technology/demos/popup">Try me</a>



<br><br>
<h2>Installation</h2>
Popup is a javascript package built for and using the ES6 module system, but it's also provided as a pre-built, minified browser package (in this package's "dist" folder).

<br>
<h3>Browser</h3>

1. Download & copy this package's "dist" folder into your web server's public folder eg. ```public/js/dist/*```.
2. Rename "dist" to "popup" eg. ```public/js/popup```
3. Load the popup script at the end of your web page (before the closing `body` tag) like this:
```
<body>
    ...

    <script src="/js/popup/popup.js"></script>
</body>
</html>

```
4. When the browser loads, popup will be attached to the browser's global window object. Use it anywhere in your scripts like this:
  
```
<button>Target</button>

<script>
    popup.open();          // Display the popup cheat sheet

    ...

    popup.closeLast();     // close the on-top popup
    
    ...
    
    popup.closeAll();

</script>
```
    
<br>
<h3>ES6 module</h3>
Install the popup package into your project using npm: 
<pre>
$ cd to/your/project
$ npm install @aamasri/popup
</pre>

Then import and use it in your project's ES6 modules:
<h4>Static import</h4>
<pre>
import popup from 'popup';

function helloWorld() {
    popup.open({ title: 'Greetings', source: 'Hello World' });
}
</pre>

<h4>Dynamic import</h4>
Leveraging Webpack's on-demand (lazy) loading and code-splitting:
<pre>
import(/* webpackChunkName: "popup" */ 'popup').then((popup) => {
    popup.closeAll();
    
    popup.open(...
});
</pre>


<br><br>
<h2>Popup Functions</h2>
<pre>popup.open({ .. }).then((popupElement) => { .. })    // create a new popup</pre>
<pre>popup.close(popupElement)                            // close a specific popup instance</pre>
<pre>popup.closeAll()                                      // close all popups</pre>
<pre>popup.closeLast()                                     // close the on-top popup</pre>


<br><br>
<h2>Popup.open Options</h2>
Here's another example with different options; eg. to load/display a fragment of the HTML returned by a URL: 
<pre>    popup.open({ 
             title: `${userName}'s User Profile`, 
             source: userUrl,
             target: document.querySelector('#target'),
             fragment: '.contact-info'
             modal: true,
             onClose: function() { alert: `Don't hesitate to call ${userName}!`; }
         }).then( function(popupElement) {
             console.log('fyi the contact info popup just launched');
             
             window.setTimeout( function() {
                popup.close(popupElement);
             }, 10000);
         });
</pre>
<br><br>
Here's the full list of popup.open options:
<table>
<tr><th align="left">Option</th><th align="left">Type</th><th align="left">Description</th><th align="left">Default</th></tr>

<tr><td>title</td><td>string | undefined</td><td>popup title, else source element title attribute</td><td>"Missing Title"</td></tr>
<tr><td>source**</td><td>string | object | undefined</td><td>the content source: html content, selector, url, or element</td><td>usage instructions</td></tr>
<tr><td>target</td><td>string | object | undefined</td><td>the popup target: html element, css selector, jQuery object, or HTML element</td><td>usage instructions</td></tr>
<tr><td>fragment</td><td>string | undefined</td><td>selector by which to extract a portion of the source HTML</td><td></td></tr>
<tr><td>modal</td><td>boolean | undefined</td><td>popup background blurring & dimming</td><td>false</td></tr>
<tr><td>showCloseButton</td><td>boolean | undefined</td><td>whether to show the close button</td><td>false</td></tr>
<tr><td>replace</td><td>boolean | undefined</td><td>whether to close any existing popups or layer up</td><td>false</td></tr>
<tr><td>onClose</td><td>function | string | undefined</td><td>callback function or eval(string) to execute after popup dismissed</td><td></td></tr>
<tr><td>classes</td><td>string | undefined</td><td>additional classes to apply to the popup container element</td><td></td></tr>
<tr><td>attributes</td><td>string | undefined</td><td>attributes to apply to the popup container element eg. 'data-ignore-events="true"'</td><td></td></tr>
</table>

<h4>Notes</h4>
1. To create a chrome-less popup (ie. one with no padding or header, where the specified content completely fills the popup box), simply omit the title option.
2. If loading a URL fails then it may be due to a CORS issue (if it's for a different domain). 

<br>
** url sources which are complete HTML documents will be wrapped in an iframe. To avoid this use the "fragment" option.
<br><br>



<br><br>
<h2>Popup Styling</h2>
The popup's default CSS styles may easily be themed to fit your application.
Change any of these default styles in your CSS :root or body scope: 

<pre>
:root {
    --popupBackground: #FFF;
    --popupFontFamily: Helvetica, Verdana, sans-serif;
    --popupBorder: none;
    --popupBoxShadow: 0 0 10px #DDD;
    --popupBorderRadius: 1rem;
    --popupLineHeight: 1.8;
    --popupIconSize: 1.3rem;
    --popupIconColor: #888;
    --popupModalBackgroundColor: rgba(170, 170, 170, 0.3);
</pre>
<br><br><br>


<h2>Package Management</h2>

Popup supports [npm](https://www.npmjs.com/package/popup) under the name `@aamasri/popup`.

<h3>NPM</h3>
<pre>$ npm install @aamasri/popup --save</pre>

<br>
<h3>Dependencies</h3>
Popup depends on 2 external packages:
<ol>
<li>jquery</li>
<li>animejs</li>
<li>@aamasri/dom-utils</li>
<li>@aamasri/busy-js</li>
</ol>
These dependencies are bundled (as separate pre-built 'chunks') in this package's "dist" folder.  
<br>
Invoking the popup() function will dynamically load these dependencies at run-time (if these scripts don't already exist on the page) and they'll be added to the global window object.
<br><br>
If your page already loads the jQuery, animejs, @aamasri/busy-js, or @aamasri/dom-utils packages, popup will use them instead.


<br><br>

## Publishing Updates
<ol>
<li>Increment the "version" attribute of `package.json`.</li>
<li>Update the "versionDescription" string of `package.json`.</li>
<li>Re-build the browser output bundle...<pre>npm run build-production</pre>
...and observe that webpack completed with no errors.<br><br></li>
<li>Test the bundle by loading page: "dist/index.html" in a browser (setup a development webserver).</li>
<li>Publish to the git repository and npm package registry:<pre>npm run publish</pre></li>
</ol>


<br>
<h2>Authors</h2>

* [Ananda Masri](https://github.com/aamasri)
* And awesome [contributors](https://github.com/aamasri/popup/graphs/contributors)
