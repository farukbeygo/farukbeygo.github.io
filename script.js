// Inspired by 
// https://i.redd.it/pij77ougdwr01.png
// https://www.reddit.com/r/generative/comments/8c8g9k/generative_design_for_a_handpainted_mural/
// Also look for https://codepen.io/stanko/pen/dyPaZMq

const rows = 120;
const columns = 120;
const step = 6;
const velocity = step;
const w = columns * step;
const h = rows * step;
const maxLength = 16;
const dotStep = 2.1;

const vectors = [];
const colorNoise = [];
const dots = [];
const seed = Math.floor(Math.random() * 10000);

document.querySelector('.seed').innerHTML = seed;


// const blue = '#4b5575';
// const green = '#5c9191';
// const orange = '#d6907d';
// const yellow = '#efdba6';
const blue = { r: 75, g: 85, b: 117 };
const green = { r: 105, g: 153, b: 152 };
const orange = { r: 214, g: 144, b: 125 };
const yellow = { r: 239, g: 219, b: 166 };
const colors = [blue, green, orange, yellow];

function pickColorFromGradient(color1, color2, weight) {
  const w1 = weight;
  const w2 = 1 - w1;
  const rgb = [Math.round(color1.r * w1 + color2.r * w2),
    Math.round(color1.r * w1 + color2.r * w2),
    Math.round(color1.b * w1 + color2.b * w2)];
  return rgb;
}


function setup() {
  createCanvas(w, h);
  background('#fbf5e7');
  frameRate(15);
  
  noiseSeed(seed);
  
  for (let i = 0; i <= rows; i++) {
    vectors[i] = [];
    for (let j = 0; j <= columns; j++) {
      const x = i * step;
      const y = j * step;
      const n = noise(i / 70, j / 70);
      const a = n * 2 * PI;
      
      const directionVector = { x: 0, y: 0 };
      
      // directionVector.y = sin(x / w * PI) * 3;
      
      const vectorX = cos(a) * velocity + directionVector.x;
      const vectorY = sin(a) * velocity + directionVector.y;
      
      const endX = x + vectorX;
      const endY = y + vectorY;
      // stroke(n * 200);
      vectors[i][j] = {
        startX: x,
        startY: y,
        endX,
        endY,
        angle: a,
        vectorX,
        vectorY,
      };
    }
  }
    
  for (let i = 0; i <= rows; i = i + dotStep) {
    for (let j = 0; j <= columns; j = j + dotStep) {      
      const x = i * step + Math.floor(Math.random() * step) - (step / 2);
      const y = j * step + Math.floor(Math.random() * step) - (step / 2);
      
      dots.push({
        x,
        y,
        color: getColor(x, y),
        length: 0,
      })
    }
  }
}

function getDistance(v1, v2) {
  const x = v1.x - v2.x;
  const y = v1.y - v2.y;
  return Math.sqrt(x * x + y * y);
}

function addVectors(v1, v2) {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y
  };
}

function multiplyVector(v, factor) {
  return {
    x: v.x * factor,
    y: v.y * factor
  };
}

function offsetColor(value, maxOffset = 8) {
  return Math.floor(value + Math.random() * (maxOffset * 2) - maxOffset) % 256;
}

function getColor(x, y) {
  const rand = Math.random();

  let colorIndex;
  
  const colorLimits = {
    blue: h * 0.80,
    green: h * 0.55,
    orange: h * 0.30,
  };

  if (y > colorLimits.blue) {
    colorIndex = 0;
    
    if (rand > 0.97) {
      colorIndex = 3;
    } else if (rand > 0.92) {
      colorIndex = 2;
    } else if (rand > 0.80) {
      colorIndex = 1;
    }
  } else if (y > colorLimits.green) {
    colorIndex = 1;
    
    if (rand > 0.92) {
      colorIndex = 3;
    } else if (rand > 0.75) {
      colorIndex = 1;
    } else if (rand > 0.60) {
      colorIndex = 0;
    }
  } else if (y > colorLimits.orange) {
    colorIndex = 2;
    
    if (rand > 0.97) {
      colorIndex = 0;
    } else if (rand > 0.80) {
      colorIndex = 3;
    } else if (rand > 0.65) {
      colorIndex = 1;
    }
  } else {
    colorIndex = 3;
    
    if (rand > 0.98) {
      colorIndex = 0;
    } else if (rand > 0.93) {
      colorIndex = 1;
    } else if (rand > 0.80) {
      colorIndex = 2;
    }
  }
  
  const color = colors[colorIndex];
  
  return `rgb(${ offsetColor(color.r) }, ${ offsetColor(color.g) }, ${ offsetColor(color.b) })`
}


function drawDots() {
  for (let i = 0; i < dots.length; i++) {
    const dot = dots[i];
    stroke(dot.color);
    strokeWeight(3);
    const x = floor(dot.x / step);
    const y = floor(dot.y / step);

    if (x + 1 > columns || y + 1 > rows || x < 0 || y < 0) {
      continue;
    }

    if (dot.length > maxLength) {
      noLoop();
      return;
    }
    
    const nearVectors = [
      vectors[x][y],
      vectors[x + 1][y],
      vectors[x][y + 1],
      vectors[x + 1][y + 1]
    ];

    let nextDot = {
      ...dot
    };

    nearVectors.forEach((v, index) => {
      const distance = getDistance(dot, {
        x: v.startX,
        y: v.startY
      });

      const forceVector = multiplyVector({
        x: v.vectorX,
        y: v.vectorY
      }, (10 - distance) / 20);

      nextDot = addVectors(nextDot, forceVector);
    });

    if (Math.random() > 0.4) {
      line(dot.x, dot.y, nextDot.x, nextDot.y);
    }
    
    dots[i] = {
      ...dot,
      ...nextDot,
      length: dot.length + 1,
    };
  }
}


function draw() {
  drawDots();
}