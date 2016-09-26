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