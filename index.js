// Import stylesheets
import './style.css';

const pixi = require('pixi.js');
const TinyQueue = require('tinyqueue');

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

const q = new TinyQueue([start], (a, b) => a.d - b.d);
const seen = {};

start.d = 0.0;
start.sr(0);
start.sa(255);

// const max = width * height + 100;
const before = performance.now();
while (q.length > 0) {
  const top = q.pop();

  // max--;
  // if (max < 0) {
  //   console.log("buhu");
  //   break;
  // }
  // if (max % 10000 === 0) {
  //   console.log("max", max);
  // }

  // const idx = top.x + ',' + top.y;
  // if (idx in seen) {
  //   continue;
  // }
  // seen[idx] = true;

  const q2 = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) {
        continue;
      }
      const nx = top.x + dx;
      const ny = top.y + dy;
      if (0 <= nx && nx < width && 0 <= ny && ny < height) {
        const nb = getPixel(nx, ny);
        const idx = nb.x + ',' + nb.y;
        if (!(idx in seen)) {
          seen[idx] = true;
          q2.push(nb);
          const d = Math.sqrt(dx * dx + dy * dy);
          nb.d = top.d + d + 15.0 * (Math.random() - 0.2);
          // nb.sr(top.r() + 20.0 * 2.0 * (Math.random() - 0.5));
          const df = 1.0;
          nb.sr(top.r() + df * Math.random() * (nb.d - top.d));
          nb.sg(top.g() + df * Math.random() * (nb.d - top.d));
          nb.sb(top.b() + df * Math.random() * (nb.d - top.d));
          nb.sa(255);
        }
      }
    }
  }
  while (q2.length > 0) {
    const nb = q2.pop();
    q.push(nb);
  }
}

for (let x = 0; x < width; x++) {
  for (let y = 0; y < height; y++) {
    const p = getPixel(x, y);
    const rf = 2.0;
    p.sr(p.r() * rf);
  }
}

const after = performance.now();
const p = document.createElement(p);
p.innerHTML = 'time: ' + Math.round(after - before) + 'ms';
document.body.appendChild(document.createElement('br'));
document.body.appendChild(p);
// start.sr(255);
// start.sa(255);


ctx.putImageData(imageData, 0, 0);