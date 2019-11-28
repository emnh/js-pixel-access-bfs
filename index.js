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
start.sg(0);
start.sb(0);
start.sa(255);

// const max = width * height + 100;
const f = (x) => Math.max(0, Math.min(255, x));
const before = performance.now();
while (q.length > 0) {
  const top = q.pop();

  const q3 = [];
  const k2 = 5;
  for (let dx = -k2; dx <= k2; dx++) {
    for (let dy = -k2; dy <= k2; dy++) {
      const nx = top.x + dx;
      const ny = top.y + dy;
      if (0 <= nx && nx < width && 0 <= ny && ny < height) {
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= k2) {
          const nb = getPixel(nx, ny);
          const idx = nb.x + ',' + nb.y;
          if (!(idx in seen)) {
            // if (d < k2) {
            //   seen[idx] = true;
            // }
            const df = 1.0;
            q3.push(nb);
            const g = x => x; //Math.random() * 255;
            nb.sr(g(f(top.r() + df * Math.random())));
            nb.sg(g(f(top.g() + df * Math.random())));
            nb.sb(g(f(top.b() + df * Math.random())));
            nb.sa(255);
            // nb.sr(top.r());
          }
        }
      }
    }
  }

  while (q3.length > 0) {
    const top = q3.pop();
    const q2 = [];
    const k = 1;
    for (let dx = -k; dx <= k; dx++) {
      for (let dy = -k; dy <= k; dy++) {
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
            const d = Math.sqrt(dx * dx + dy * dy);
            nb.d = top.d + d + 25.0 * (Math.random() - 0.2);
            q2.push(nb);
            // const df = 1.0;
            // nb.sr(f(top.r() + df * Math.random() * (nb.d - top.d)));
            // nb.sg(f(top.g() + df * Math.random() * (nb.d - top.d)));
            // nb.sb(f(top.b() + df * Math.random() * (nb.d - top.d)));
            // nb.sa(255);
          }
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
    const rf = 5.0;
    const rk = 0.0;
    p.sr(f(p.r() * rf + rk));
    p.sg(f(p.g() * rf + rk));
    p.sb(f(p.b() * rf + rk));
  }
}

const after = performance.now();
const p = document.createElement(p);
p.innerHTML = 'time: ' + Math.round(after - before) + 'ms';
document.body.appendChild(document.createElement('br'));
document.body.appendChild(p);

ctx.putImageData(imageData, 0, 0);