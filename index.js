// Import stylesheets
import './style.css';

const pixi = require('pixi.js');

const canvas = document.createElement('canvas');

document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

const width = 640;
const height = 480;
canvas.width = width;
canvas.height = height;

const imageData = ctx.createImageData(width, height);

const getPixel = function(xCoord, yCoord) {
  function getColorIndicesForCoord(x, y, width) {
    var red = y * (width * 4) + x * 4;
    return [red, red + 1, red + 2, red + 3];
  }

  var colorIndices = getColorIndicesForCoord(xCoord, yCoord, width);

  var redIndex = colorIndices[0];
  var greenIndex = colorIndices[1];
  var blueIndex = colorIndices[2];
  var alphaIndex = colorIndices[3];

  var redForCoord = imageData.data[redIndex];
  var greenForCoord = imageData.data[greenIndex];
  var blueForCoord = imageData.data[blueIndex];
  var alphaForCoord = imageData.data[alphaIndex];

  return {
    x: xCoord,
    y: yCoord,
    r: () => imageData.data[redIndex],
    g: () => imageData.data[greenIndex],
    b: () => imageData.data[blueIndex],
    a: () => imageData.data[alphaIndex],
    sr: (x) => imageData.data[redIndex] = x,
    sg: (x) => imageData.data[greenIndex] = x,
    sb: (x) => imageData.data[blueIndex] = x,
    sa: (x) => imageData.data[alphaIndex] = x
  };
};

const start = getPixel(width / 2, height / 2);

const q = [start];
const seen = {};

const max = width * height;
const before = performance.now();
while (q.length > 0) {
  const top = q.unshift();

  max--;
  if (max < 0) {
    console.log("buhu");
    break;
  }
  if (max % 1000 === 0) {
    console.log("max", max);
  }

  const idx = top.x + ',' + top.y;
  if (idx in seen) {
    continue;
  }
  seen[idx] = true;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const nx = top.x + dx;
      const ny = top.y + dy;
      if (0 <= nx && nx < width && 0 <= ny && ny < height) {
        const nb = getPixel(nx, ny);
        q.push(nb);
      }
    }
  }
}
const after = performance.now();
const p = document.createChild(p);
p.innerHTML = 'time: ' + (after - before) + 'ms';
document.body.appendChild(p);
// start.sr(255);
// start.sa(255);


ctx.putImageData(imageData, 0, 0);