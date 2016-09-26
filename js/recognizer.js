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