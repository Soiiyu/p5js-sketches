// Based on an image i was sent https://cdn.discordapp.com/attachments/215543685696323586/960426234649661460/abstract-gradient-pink-purple-stripes-on-purple-background-vector.jpg

//alternative source https://www.freepik.com/premium-vector/abstract-gradient-pink-purple-stripes-gradient-dark-purple-pink-background_4820346.htm#page=6&position=5&from_view=author

let lines = []
let w = 5
let topgap = 100
let layers = 5
let speed = 5
let angle = 65

let color1;
let color2;
let length;
const Y_AXIS = 1;
const X_AXIS = 2;

function setup() {
  // angleMode(DEG)
  createCanvas(640, 360);
  
  color1 = color(170, 20, 84)
  color2 = color(30, 20, 40)
  
  length = floor(width / w) + 50
  for(let i = 0; i < length * layers; i++) {
    let x = w/2 + (i % length) * w
    let y = topgap + random(height - topgap)
    let z = floor(i / length)
    let c = [random(93,255), 90, 208]
    let point = {x ,y, z, c}
    lines.push(point)
  }
  // console.log(lines)
}

function draw() {
  // background(0);
  setGradient(0, 0, width, height, color1, color2, Y_AXIS)
  rotate(PI * angle/180)
  translate(0, -50)
  strokeCap(ROUND);
  strokeWeight(w)
  for(let p of lines) {
    // point(p.x, p.y)
    
    stroke(...p.c, 255  * Math.pow(1 - (p.z / layers), 2))
    line(p.x, p.y - width / 4 * p.z, p.x, height * 4)
    p.x -= speed / p.z
    if(p.x < 0) {
      p.x = w/2 + length * w
      p.y = topgap + random(height - topgap)
    }
  }
}

function setGradient(x, y, w, h, c1, c2, axis) {
  noFill();

  if (axis === Y_AXIS) {
    // Top to bottom gradient
    for (let i = y; i <= y + h; i++) {
      let inter = map(i, y, y + h, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(x, i, x + w, i);
    }
  } else if (axis === X_AXIS) {
    // Left to right gradient
    for (let i = x; i <= x + w; i++) {
      let inter = map(i, x, x + w, 0, 1);
      let c = lerpColor(c1, c2, inter);
      stroke(c);
      line(i, y, i, y + h);
    }
  }
}