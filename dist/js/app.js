(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var canvas = {};

/**
 * Enable arbitrary draving on a given canvas element.
 */
canvas.createDrawableCanvas = function(canvas) {
  var ctx = canvas.getContext('2d');

  // TODO - We might want to introduce more configuration options concerning styling below.
  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  // Keep track of whether we are dragging or not so that 
  // howering over the canvas does not trigger drawing.
  var dragging = false;

  canvas.addEventListener('mousedown', function(e) {
    dragging = true;

    var x = (e.offsetX || e.layerX);
    var y = (e.offsetY || e.layerY);

    ctx.beginPath();
    ctx.moveTo(x, y);
  });

  // We do this on the body so that the cursor does not keep drawing on
  // mouseover if we mouseup outside the element.
  document.body.addEventListener('mouseup', function(e) {
    dragging = false;
  });

  canvas.addEventListener('mousemove', function(e) {
    if (dragging) {
      var x = (e.offsetX || e.layerX);
      var y = (e.offsetY || e.layerY);

      ctx.lineTo(x, y);
      ctx.stroke();
    }
  });
};

/**
 * Returns a new canvas element with cropped image data.
 * Found on StackOverflow.
 * Link is http://stackoverflow.com/questions/11796554/automatically-crop-html5-canvas-to-contents
 */
canvas.cropCanvasData = function(canvas) {
  var ctx = canvas.getContext('2d');

  var w = canvas.width;
  var h = canvas.height;

  var pix = {
    x: [],
    y: []
  };

  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  var x, y, index;

  for (y = 0; y < h; y++) {
    for (x = 0; x < w; x++) {
      index = (y * w + x) * 4;
      if (imageData.data[index + 3] > 0) {
        pix.x.push(x);
        pix.y.push(y);
      }   
    }
  }

  pix.x.sort(function(a, b) { return a - b; });
  pix.y.sort(function(a, b) { return a - b; });

  var n = pix.x.length-1;

  w = pix.x[n] - pix.x[0];
  h = pix.y[n] - pix.y[0];

  var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

  var croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = w;
  croppedCanvas.height = h;
  var croppedCtx = croppedCanvas.getContext('2d');
  croppedCtx.putImageData(cut, 0, 0);
  return croppedCanvas;
};

/**
 * Resizes a canvas element to provided size.
 */
canvas.resizeCanvasElement = function(elem, width, height) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(elem, 0, 0, width, height);
  return canvas;
};

/**
 * Shrinks a canvas in multiple steps in order to preserve image quality.
 */
canvas.shrinkCanvasElement = function(elem) {
  // TODO - This really should not be hard coded but I tried so hard to automate this process
  // and really I just gave up.
  elem = this.resizeCanvasElement(elem, 500 / 2, 500 / 2);
  elem = this.resizeCanvasElement(elem, 500 / 4, 500 / 4);
  elem = this.resizeCanvasElement(elem, 500 / 8, 500 / 8);
  elem = this.resizeCanvasElement(elem, 30, 30);
  return elem;
};

canvas.clear = function(canvas) {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
};

// Export the module to Node or whatever.
module.exports = canvas;
},{}],2:[function(require,module,exports){
// Module imports.
var HandwritingRecognizer = require('./recognizer');

var trainingData = [
  {output: {a: 1}, input: [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1]},
  {output: {a: 1}, input: [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1]},
  {output: {a: 1}, input: [0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1]},

  {output: {b: 1}, input: [1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1]},
  {output: {b: 1}, input: [0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1]},
  {output: {b: 1}, input: [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1]},

  {output: {c: 1}, input: [0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1]},
  {output: {c: 1}, input: [1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1]},
  {output: {c: 1}, input: [0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1]},

  {output: {d: 1}, input: [0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1]},
  {output: {d: 1}, input: [0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1]},
  {output: {d: 1}, input: [0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1]},

  {output: {e: 1}, input: [1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1]},
  {output: {e: 1}, input: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1]},
  {output: {e: 1}, input: [1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1]},
  {output: {e: 1}, input: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]},
  {output: {e: 1}, input: [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1]},

  {output: {f: 1}, input: [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]},
  {output: {f: 1}, input: [0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0]},
  {output: {f: 1}, input: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0]},
  {output: {f: 1}, input: [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0]},

  {output: {g: 1}, input: [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1]},
  {output: {g: 1}, input: [1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1]},
  {output: {g: 1}, input: [0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1]},

  {output: {h: 1}, input: [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1]},
  {output: {h: 1}, input: [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1]},
  {output: {h: 1}, input: [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1]},

  {output: {i: 1}, input: [0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0]},
  {output: {i: 1}, input: [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]},
  {output: {i: 1}, input: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0]},
  {output: {i: 1}, input: [0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0]},
  {output: {i: 1}, input: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1]},
  {output: {i: 1}, input: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1]},
  {output: {i: 1}, input: [1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]},
  {output: {i: 1}, input: [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]},
  {output: {i: 1}, input: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1]},
  {output: {i: 1}, input: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]},
  {output: {i: 1}, input: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1]},

  {output: {j: 1}, input: [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1]},
  {output: {j: 1}, input: [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1]},
  {output: {j: 1}, input: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1]},
  {output: {j: 1}, input: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1]},

  {output: {k: 1}, input: [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1]},
  {output: {k: 1}, input: [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1]},
  {output: {k: 1}, input: [1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1]},

  {output: {l: 1}, input: [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]},
  {output: {m: 1}, input: [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1]},
  {output: {n: 1}, input: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1]},
 
  {output: {o: 1}, input: [0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1]},
  {output: {o: 1}, input: [0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1]},
  {output: {o: 1}, input: [0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1]},

  {output: {p: 1}, input: [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0]},
  {output: {q: 1}, input: [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0]},
  {output: {r: 1}, input: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]},
  {output: {s: 1}, input: [1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1]},
  {output: {t: 1}, input: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0]},
  {output: {u: 1}, input: [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1]},
  {output: {v: 1}, input: [1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0]},
  {output: {w: 1}, input: [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0]},

  {output: {x: 1}, input: [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1]},
  {output: {x: 1}, input: [1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1]},
  {output: {x: 1}, input: [1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1]},
  {output: {x: 1}, input: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1]},

  {output: {y: 1}, input: [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1]},
  {output: {z: 1}, input: [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1]}
];

function train(array) {
  trainingData = trainingData.concat(array);
}

train([{"output":{"a":1},"input":[0,0,1,1,1,1,0,1,1,0,0,1,1,1,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,1]},{"output":{"x":1},"input":[1,1,0,0,0,1,0,1,1,1,1,1,0,0,1,1,1,0,0,0,1,1,1,1,0,1,1,0,0,1,1,1,0,0,0,0]},{"output":{"x":1},"input":[0,0,0,0,1,1,1,1,0,1,1,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1,1,0,0,1,1,1,0,0,0,0]},{"output":{"x":1},"input":[0,0,0,1,0,0,1,0,1,1,0,0,1,1,1,0,0,0,0,1,1,1,1,0,1,1,0,1,1,1,1,1,0,0,0,1]},{"output":{"x":1},"input":[1,0,0,0,1,1,1,1,0,1,1,0,0,1,1,1,1,0,0,0,1,1,1,0,0,1,1,1,1,1,1,1,0,0,0,1]},{"output":{"x":1},"input":[0,0,0,0,1,1,1,1,0,1,1,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1,0,0,0,1,1,0,0,0,0,0]}]);
train([{"output":{"x":1},"input":[0,0,0,0,1,1,1,1,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,1,0,1,1,0,0,1,1,1,0,0,0,0]},{"output":{"x":1},"input":[0,0,0,0,1,1,1,1,0,1,1,0,0,1,1,1,0,0,0,0,1,1,0,0,0,1,1,1,1,1,1,1,0,0,0,0]},{"output":{"x":1},"input":[0,0,0,0,1,1,1,1,0,1,1,0,0,1,1,1,0,0,0,0,1,1,0,0,1,1,1,1,1,0,1,0,0,0,1,1]},{"output":{"x":1},"input":[0,0,0,0,1,1,1,0,0,1,1,1,1,1,1,1,0,0,0,1,1,1,0,0,1,1,0,1,1,0,1,0,0,0,1,1]}]);
train([{"output":{"a":1},"input":[0,1,1,1,1,1,1,1,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,1]},{"output":{"b":1},"input":[1,1,1,1,1,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,1,0,0,1,1,1,0]},{"output":{"c":1},"input":[0,1,1,1,1,1,0,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1]},{"output":{"d":1},"input":[0,0,0,1,1,1,0,0,0,1,0,1,0,0,0,1,1,1,0,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0,0,1]},{"output":{"e":1},"input":[0,1,1,1,1,1,1,1,1,0,0,1,1,0,1,0,0,1,1,0,1,0,0,1,1,1,1,0,0,1,1,1,0,0,0,1]},{"output":{"f":1},"input":[0,0,1,1,1,1,0,1,1,0,0,0,1,1,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0]},{"output":{"g":1},"input":[0,1,1,0,1,1,1,1,1,1,0,1,1,0,0,1,0,1,1,0,0,1,0,1,1,0,1,1,1,1,1,1,1,1,1,0]},{"output":{"h":1},"input":[0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,1,1,1]},{"output":{"i":1},"input":[1,0,0,0,1,1,1,0,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0,0,1,1,1,0,0,0,1,0,0,0,0,0]},{"output":{"j":1},"input":[0,0,0,1,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1]},{"output":{"k":1},"input":[0,0,1,1,1,1,1,1,1,1,1,0,0,0,1,0,1,0,0,0,1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1]},{"output":{"l":1},"input":[0,0,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1]},{"output":{"m":1},"input":[1,1,1,1,1,1,1,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1]},{"output":{"n":1},"input":[1,1,1,1,1,1,1,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1]},{"output":{"o":1},"input":[1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1,1,1,1,1,1,1,1]},{"output":{"p":1},"input":[1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,1,0,0,1,0,1,0,0,0,1,1,1,0,0,0]},{"output":{"q":1},"input":[0,0,1,1,0,1,0,1,1,1,1,1,1,1,0,1,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,1,1,1,1,0]},{"output":{"r":1},"input":[1,1,1,1,1,1,1,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0]},{"output":{"s":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,0,0,1,1,0,1,1,0,1,1,0,0,1,1,1]},{"output":{"t":1},"input":[1,0,0,0,1,1,1,1,1,1,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0]},{"output":{"u":1},"input":[1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,0,0,0,1,1,1,1,1,1,1,1,0]},{"output":{"v":1},"input":[1,1,1,1,0,0,0,0,0,1,1,1,0,0,0,0,1,1,0,0,0,1,1,0,0,0,1,1,0,0,1,1,1,0,0,0]},{"output":{"w":1},"input":[1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,1,1,0,1,1,1,1,0,0]},{"output":{"x":1},"input":[0,0,0,0,1,1,0,0,0,1,1,0,1,1,1,1,0,0,0,0,1,1,1,1,0,1,1,0,0,1,1,1,0,0,0,0]},{"output":{"y":1},"input":[0,0,0,0,0,1,1,1,0,0,0,1,1,1,1,1,0,1,0,1,1,0,1,1,0,1,1,1,1,0,1,1,1,1,0,0]},{"output":{"z":1},"input":[1,0,0,0,0,1,1,0,0,0,1,1,1,0,0,1,1,1,1,1,1,1,0,1,0,1,1,0,0,1,0,1,0,0,0,1]}]);
train([{"output":{"c":1},"input":[0,1,1,1,1,1,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,1]},{"output":{"c":1},"input":[0,1,1,1,1,0,0,1,0,0,1,1,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1]},{"output":{"c":1},"input":[0,0,0,1,1,1,0,1,1,1,0,1,1,1,1,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,1]},{"output":{"c":1},"input":[0,1,1,1,1,0,1,1,0,0,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0]},{"output":{"c":1},"input":[0,1,1,1,1,1,0,1,1,0,0,1,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,1]},{"output":{"c":1},"input":[0,0,0,1,1,1,0,0,1,1,0,1,1,1,1,0,0,1,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1]},{"output":{"c":1},"input":[0,0,1,1,1,0,0,1,1,0,1,1,0,1,0,0,0,1,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1]},{"output":{"c":1},"input":[0,0,1,1,1,1,0,0,1,1,0,1,0,1,1,0,0,1,0,1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0]}]);
train([{"output":{"a":1},"input":[1,1,1,1,1,1,1,0,0,0,1,1,1,0,0,0,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,0,0,0,0,1]},{"output":{"b":1},"input":[0,0,0,0,1,1,1,1,1,1,1,1,0,0,1,1,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,1,1,1]},{"output":{"c":1},"input":[0,1,1,1,1,1,0,1,1,0,1,1,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1]},{"output":{"d":1},"input":[0,0,0,1,1,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1]},{"output":{"e":1},"input":[1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,0,0,1,1,1,1,0,0,1]},{"output":{"f":1},"input":[0,1,1,1,1,1,1,1,1,1,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0]},{"output":{"g":1},"input":[0,1,0,0,1,1,1,1,1,0,0,1,1,0,1,0,0,1,1,0,1,0,0,1,1,0,1,1,1,1,1,1,1,1,0,0]},{"output":{"g":1},"input":[1,1,1,0,1,1,1,1,1,0,0,1,1,0,1,0,0,1,1,0,1,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0]},{"output":{"g":1},"input":[0,0,0,0,1,1,0,0,0,0,0,1,0,1,1,0,0,1,1,1,1,0,0,1,1,0,1,1,1,1,1,1,1,1,1,0]},{"output":{"g":1},"input":[1,1,1,0,0,1,1,0,1,1,0,1,1,0,0,1,0,1,1,0,0,1,0,1,1,0,1,1,1,1,1,1,1,1,1,0]},{"output":{"h":1},"input":[1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,1,1,1]},{"output":{"g":1},"input":[1,1,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0,1,1,0,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1]},{"output":{"i":1},"input":[1,0,0,0,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0]},{"output":{"j":1},"input":[0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1]},{"output":{"k":1},"input":[1,1,1,1,1,1,0,0,0,1,1,0,0,0,1,1,1,1,0,0,1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,0]},{"output":{"l":1},"input":[1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1]},{"output":{"m":1},"input":[1,1,1,1,1,1,1,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,0,0,1,1,0,0,0,0,0,1,1,1,1,1]},{"output":{"m":1},"input":[0,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,0,0,0,0,1,1,1,1,1]}]);
train([{"output":{"m":1},"input":[1,1,1,1,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,1]},{"output":{"m":1},"input":[1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1]},{"output":{"m":1},"input":[1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,0,0,0,0,1,1,1,1,1]},{"output":{"n":1},"input":[0,0,1,1,1,1,1,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1]},{"output":{"m":1},"input":[0,1,1,1,1,1,1,1,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1]},{"output":{"m":1},"input":[0,1,1,1,1,0,0,1,1,1,1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1]},{"output":{"m":1},"input":[1,1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1]}]);
train([{"output":{"y":1},"input":[1,1,1,0,1,0,0,0,1,0,1,1,0,1,1,0,0,1,0,1,0,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1]},{"output":{"g":1},"input":[0,1,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,1,1,0,1,0,0,1,1,1,1,0,1,1,1,1,1,1,1,0]},{"output":{"y":1},"input":[1,1,1,0,0,1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,1,0,0,1,1,1,1,1,1,1]}]);
train([{"output":{"y":1},"input":[1,0,0,0,1,1,1,1,0,0,0,1,0,1,1,0,0,1,0,1,1,0,0,1,0,1,1,0,0,1,1,1,1,1,1,1]},{"output":{"g":1},"input":[0,0,0,0,0,1,0,1,1,0,0,1,1,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1]},{"output":{"y":1},"input":[0,0,0,0,0,1,1,1,1,1,0,1,1,0,1,1,0,1,0,0,1,1,0,1,0,0,1,1,1,1,1,1,1,1,1,1]},{"output":{"y":1},"input":[0,0,0,0,1,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,0]},{"output":{"b":1},"input":[1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,1,0,0,1,1,0,1,0,0,0,1,0,1,0,0,0,1,1,0]},{"output":{"y":1},"input":[1,1,1,0,0,1,1,1,1,1,0,1,0,0,0,1,0,1,0,0,1,1,0,1,0,0,1,1,1,1,1,1,1,1,1,1]}]);
train([{"output":{"h":1},"input":[1,1,1,1,1,1,0,0,1,1,1,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1]},{"output":{"i":1},"input":[1,0,0,0,0,0,1,0,0,1,1,1,1,0,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,0]},{"output":{"j":1},"input":[0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,0]},{"output":{"y":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,1,0,1,0,0,1,1,1,1,0,1,1,1,1,0]},{"output":{"j":1},"input":[0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1]},{"output":{"y":1},"input":[0,0,0,0,1,1,0,0,0,0,1,1,1,1,0,0,0,1,1,1,1,1,0,1,0,0,1,1,1,1,1,1,1,1,1,1]},{"output":{"j":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1]},{"output":{"j":1},"input":[0,0,0,1,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,0,1,1,1,1,1,1,1,1,0,0,0]},{"output":{"j":1},"input":[0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1]},{"output":{"j":1},"input":[0,0,0,1,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,0]},{"output":{"j":1},"input":[0,0,0,1,1,1,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1]},{"output":{"u":1},"input":[1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1]},{"output":{"u":1},"input":[1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,1,1,0,0,1,1,1,1,0]},{"output":{"u":1},"input":[0,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1]},{"output":{"u":1},"input":[1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,0,0,1,1,1,0,1,1,1,0,0,0]},{"output":{"u":1},"input":[1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,0,0,0,1,1,1,1,1,1,1,0,0]},{"output":{"u":1},"input":[1,1,1,1,1,1,1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1]}]);
train([{"output":{"!":1},"input":[0,0,0,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,1]},{"output":{"!":1},"input":[1,0,0,0,0,1,1,1,0,0,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,0,0,1,1,1,0,0,0,0,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,1,0,0,0,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,0,0,1,1,1,1,0,1,1,0,0,1,1,1,0,0,0,1]},{"output":{"!":1},"input":[1,1,0,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,1]}]);
train([{"output":{"a":1},"input":[0,0,1,1,1,1,1,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1]},{"output":{"!":1},"input":[0,0,0,1,0,1,0,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,0,1,0,0,0,0,0,1]},{"output":{"c":1},"input":[0,0,1,1,1,1,0,1,1,0,1,1,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1]},{"output":{"c":1},"input":[0,0,1,1,1,1,0,1,1,0,0,1,0,1,1,0,0,1,0,1,0,0,0,1,1,1,0,0,0,1,1,0,0,0,0,0]},{"output":{"!":1},"input":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,1,0,0,1,1,1,0,0,0,0]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,1,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,0,0,0,1,1,0,0,0,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,1,1,1,0,1,1,1,1,0,0,0,1,1,0,0,0,0]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,0,0,1,0,1,1,0,0,1,1,1,1,0,0]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,1,1,0,0,0,0]}]);
train([{"output":{"a":1},"input":[0,1,1,1,1,1,1,1,0,0,0,1,1,1,0,0,0,1,1,0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,1,1]},{"output":{"b":1},"input":[1,1,1,1,1,0,1,1,1,1,1,1,0,0,1,1,0,1,0,0,1,1,0,1,0,0,1,1,0,1,0,0,0,1,1,1]},{"output":{"c":1},"input":[0,0,0,1,1,0,0,0,1,1,1,1,0,1,1,0,0,1,0,1,0,0,0,1,1,1,0,0,0,1,1,0,0,0,0,1]},{"output":{"d":1},"input":[0,0,0,1,1,0,0,0,1,1,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,1,1,1,1,1,1,1,0,1]},{"output":{"d":1},"input":[0,0,0,0,1,1,0,0,0,1,1,1,0,0,0,1,0,1,0,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1]},{"output":{"d":1},"input":[0,0,0,1,1,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1]},{"output":{"e":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,1]},{"output":{"e":1},"input":[0,0,0,0,1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,0,1,1,1,1,0,0,1,1,1,1,1,1,1,0,1]},{"output":{"e":1},"input":[1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,0,0,0,1]},{"output":{"e":1},"input":[0,1,1,1,0,0,0,1,1,1,1,1,1,1,1,0,0,1,1,0,1,0,0,1,1,0,1,0,0,1,1,1,1,0,0,0]},{"output":{"i":1},"input":[1,0,0,0,0,0,1,0,0,0,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0]},{"output":{"!":1},"input":[1,0,0,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,0,1]},{"output":{"i":1},"input":[1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0]},{"output":{"d":1},"input":[0,0,0,1,1,1,0,0,1,1,0,1,0,0,1,1,0,1,0,0,1,0,1,1,1,1,1,1,1,1,0,0,0,0,0,1]},{"output":{"e":1},"input":[0,1,1,1,1,1,1,1,1,0,0,1,1,0,1,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,1,1,0,0,0,0]},{"output":{"e":1},"input":[0,1,1,1,0,0,1,1,0,1,1,0,1,1,0,0,1,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1]},{"output":{"e":1},"input":[1,1,1,1,1,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0]},{"output":{"e":1},"input":[1,1,1,1,0,0,1,0,0,1,1,1,1,0,1,1,0,1,1,0,1,0,0,0,1,1,1,0,0,0,1,1,0,0,0,0]},{"output":{"e":1},"input":[0,1,1,1,1,0,1,1,0,1,1,1,1,0,0,1,0,1,1,0,0,1,0,0,1,0,1,1,0,0,1,1,1,0,0,0]},{"output":{"e":1},"input":[0,0,0,0,1,0,0,1,1,1,1,0,1,1,0,1,0,0,1,0,0,1,1,0,1,0,1,1,1,1,1,1,1,0,0,1]},{"output":{"e":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1]},{"output":{"e":1},"input":[0,0,0,0,1,0,0,0,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,0,1,0,1,1,1,1,1,1,1,0,0,1]},{"output":{"e":1},"input":[1,1,1,1,1,0,1,1,0,1,1,1,1,0,0,1,0,1,1,0,0,1,0,1,1,0,1,1,0,1,1,1,1,0,0,1]},{"output":{"e":1},"input":[0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,0,1,0,0,0,1,0,1,0,0,0,1,1,1,0,0,0]},{"output":{"e":1},"input":[0,0,0,0,1,1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,0,1,0,0,1,1,1,1,1,1,1,0,1]},{"output":{"e":1},"input":[0,0,0,1,0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,1,1,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1]}]);
train([{"output":{"b":1},"input":[1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1]},{"output":{"b":1},"input":[0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1]},{"output":{"b":1},"input":[1,1,1,1,1,1,0,0,0,1,1,1,0,0,1,1,0,1,0,0,1,1,0,1,0,0,0,1,1,1,0,0,0,1,1,1]},{"output":{"b":1},"input":[1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,1,0,1,1,0,1,1,1,1,1]},{"output":{"b":1},"input":[0,0,0,0,1,1,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,1,1]},{"output":{"b":1},"input":[1,1,1,1,1,1,1,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1]},{"output":{"b":1},"input":[1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,1,1,0,0,0,1,1,1]},{"output":{"b":1},"input":[0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,1,1]},{"output":{"b":1},"input":[1,1,1,1,1,1,1,1,1,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1]},{"output":{"b":1},"input":[0,0,0,0,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,0,1,1,0,1,0,0,1,1,0,1,0,0,0,1,1,1]},{"output":{"b":1},"input":[1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,0]},{"output":{"b":1},"input":[0,0,1,1,1,1,1,1,1,1,0,1,0,0,1,1,0,1,0,0,1,0,0,1,0,0,1,1,0,1,0,0,0,1,1,1]}]);
train([{"output":{"e":1},"input":[0,0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,0,1,1,0,1,1,1,1,1,0,1]},{"output":{"f":1},"input":[1,1,1,1,1,1,1,1,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,1,1,0,0,0]},{"output":{"f":1},"input":[0,0,0,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0]},{"output":{"f":1},"input":[1,1,1,1,1,1,1,1,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0]},{"output":{"f":1},"input":[0,0,1,1,1,1,1,1,1,1,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0]},{"output":{"f":1},"input":[0,0,1,1,1,1,1,1,1,1,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0]}]);
train([{"output":{"g":1},"input":[0,0,0,0,1,1,0,0,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1]},{"output":{"g":1},"input":[0,0,0,0,0,1,0,1,1,0,0,1,1,1,1,1,0,1,1,0,0,1,0,1,1,0,1,1,1,1,1,1,1,1,1,0]},{"output":{"h":1},"input":[1,1,1,1,1,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1]},{"output":{"i":1},"input":[1,0,0,0,0,0,1,0,0,0,0,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,0,0,0]},{"output":{"i":1},"input":[0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,0,0,0,0,0]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1]},{"output":{"i":1},"input":[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,1,1,1,0,0,0]},{"output":{"i":1},"input":[0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,0,1,1,1,1,0,0,1,1,1,0,0,0,1,1,0,0,0,0]},{"output":{"i":1},"input":[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,0,0,0,1,0,1,1,1,0,0,0,0,1,1,1]},{"output":{"i":1},"input":[1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1]},{"output":{"j":1},"input":[0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,0,1,1,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,0,1,1,0,1,0,0,0,0,0,1]},{"output":{"i":1},"input":[1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,1,1,0,0,1,1,1,1]}]);
train([{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,1,1,0,0,0,1,1,1,0,0,0,1,0,1,0,0,1,1,0,0,1,1,1,0,0,0]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,1,1,0,1,1,1,1,1,0,1,1,1,0,0,0,0]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,1,1,1,0,0,1,1,1,1,0,0,1,1,0,1,1,1,1,0,0,1,1,1,0,0,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,0,1,1,1,0,0,0,1,1,0]},{"output":{"!":1},"input":[0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1]},{"output":{"!":1},"input":[1,1,0,0,0,1,1,1,1,0,0,1,0,1,1,0,0,1,0,1,1,1,0,1,0,0,1,1,1,1,0,0,0,1,1,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,0,0,0,1,1,0,0,0,0]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1,1,1,1,1,0,1]},{"output":{"null":1},"input":[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,0]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1]}]);
train([{"output":{"!":1},"input":[1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,1,1,0,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1,0,1,1,1,1,1]},{"output":{"j":1},"input":[0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,0,0,1,1,1,0,1,1,1,0,0,0]},{"output":{"j":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1]},{"output":{"j":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,0,1,1,1,1,0,1,1,0,0,0,0]},{"output":{"j":1},"input":[0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,0,0]},{"output":{"j":1},"input":[0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,1,0,0]},{"output":{"j":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,0]},{"output":{"j":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,1,1,1,1,0,0]},{"output":{"j":1},"input":[0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,0]},{"output":{"j":1},"input":[0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,1,0,0]},{"output":{"j":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,0,0,1,1,1,0,1,1,1,1,0,0]},{"output":{"j":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,0]},{"output":{"j":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,0]},{"output":{"j":1},"input":[0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,0,0]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,1,1,1,0,1,1,1,1,0,0]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1]}]);
train([{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,1,1,1,1,1,1,1,0]},{"output":{"j":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1]},{"output":{"!":1},"input":[1,0,0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,1,1,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,1,0,0,0,1,1,1,1,1,1,1,1,0,0,0,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,1,1,1,1,0,1,1,1,1,1,1,1,1,0]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1]},{"output":{"!":1},"input":[1,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,0,1,0,1,1,1,0,1,0,0,0,0,0,1,0,0,0,0,0,1]},{"output":{"!":1},"input":[1,0,0,0,1,0,1,0,0,0,1,1,1,1,0,0,1,1,0,1,1,0,1,1,0,1,1,1,1,1,0,0,0,1,1,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,0,0,1,1]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,1]},{"output":{"!":1},"input":[0,0,0,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1,0,0]},{"output":{"!":1},"input":[0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,1,0,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1,1]},{"output":{"j":1},"input":[0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1]},{"output":{"j":1},"input":[0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,0]},{"output":{"j":1},"input":[0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,1,1,1,1,1,1]},{"output":{"j":1},"input":[0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,0]}]);

var recognizer = new HandwritingRecognizer(document.getElementById('recognition-container'), trainingData);

window.recognizer = recognizer;

window.trainingHelpers = {
  data: [],

  add: function() {
    var id = prompt();
    var data = {};
    data.output = {};
    data.output[id] = 1;
    data.input = recognizer.getTrainingData();
    this.data.push(data);
  }, 

  get: function() {
    document.body.innerHTML += '<textarea>' + JSON.stringify(this.data) + '</textarea>';
  },

  clear: function() {
    recognizer.clear()
  },

  rec: function() {
    alert(recognizer.recognize().highest);
  },

  trueData: trainingData
};
},{"./recognizer":3}],3:[function(require,module,exports){
// Module imports.
var canvas = require('./canvas');

/**
 * Creates a fully functional handwriting recognizer.
 */
function HandwritingRecognizer(container, trainingData) {
  this.container = container;
  this.trainingData = trainingData;

  this.canvas = document.createElement('canvas');
  this.canvas.className = 'handwriting-recognizer-canvas';
  this.canvas.width = 500;
  this.canvas.height = 500;
  this.ctx = this.canvas.getContext('2d');
  canvas.createDrawableCanvas(this.canvas);
  this.container.appendChild(this.canvas);

  // Train the network. If we are provided a function we consider it to be
  // the output of brain.js function toString and not actual training data.
  if (typeof trainingData === 'function') {
    this.recognizeHelper = function() {
      return trainingData(this.getTrainingData());
    };
  } else {
    this.net = new brain.NeuralNetwork();
    this.net.train(trainingData);
    this.recognizeHelper = function(data) {
      return this.net.run(this.getTrainingData());
    };
  }
}

/**
 * Returns an array of binary training data.
 */
HandwritingRecognizer.prototype.getTrainingData = function() {
  var ctx = canvas.shrinkCanvasElement(canvas.cropCanvasData(this.canvas)).getContext('2d');

  var trainingData = [];

  for (var i = 0; i < 30; i += 5) {
    for (var j = 0; j < 30; j += 5) {
      var data = ctx.getImageData(i, j, 5, 5).data;
      var hasCurrentPosition = false;

      for (var k = 0; k < data.length; k += 1) {
        if (data[k]) {
          trainingData.push(1);
          hasCurrentPosition = true;
          break;
        }
      }

      if (hasCurrentPosition === false) {
        trainingData.push(0);
      }
    }
  }

  return trainingData;
};

/**
 * Returns the closest character in two different formats: with and without ranking.
 */
HandwritingRecognizer.prototype.recognize = function() {
  var ranks = this.recognizeHelper();
  var highest = 0;
  var highestKey = null;

  for (var key in ranks) {
    if (ranks.hasOwnProperty(key)) {
      if (ranks[key] > highest) {
        highest = ranks[key];
        highestKey = key;
      }
    }
  }

  return {
    ranks: ranks,
    highest: highestKey
  }
};

HandwritingRecognizer.prototype.clear = function() {
  canvas.clear(this.canvas);
};

module.exports = HandwritingRecognizer;
},{"./canvas":1}]},{},[2])