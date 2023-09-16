// let radius = 37.5
let radius = 100
// let multiplier = 1.06
let multiplier = 0.9
let angle = 30;
let notes = 28
let bpm = 144
let startTime = 431
let beatLength;

let slider;
let p;
let button;
let objects;
let circles;
// let out = []
//360°, 50%, 97%

function setup() {
  
  angleMode(DEGREES)
  colorMode(HSB)
  slider = createSlider(0, 180, 30, 0.1)
  p = createDiv(slider.value())
  p.style('color', 'white')
  button = createButton('get objects')
  button.mousePressed(makeObjects)
  objects = createDiv()
  objects.style('color', 'white')
  angle = 180 - angle
  beatLength = 60000 / bpm
  createCanvas(512, 384);
  
}

function draw() {
  circles = []
  for(let i = 0; i < notes; i++) {
    let r = radius * Math.pow(multiplier, i)
    let a = angle * i
    // console.log(r)
    let x = r * cos(a) + width/2
    let y = r * sin(a) + height/2
    circles.push({x, y})
  }
  background(20);
  p.html(slider.value())
  angle = 180 - slider.value()
  // console.log(angle)
  noFill()
  strokeWeight(2)
  ellipse(width/2, height/2, 10)
  // beginShape()
  for(let i = 0; i<circles.length; i++) {
    let c = circles[i]
    // let [x, y, t] = [c.x, c.y, startTime + (beatLength / 4) * i].map(n => (round(n)))
    // out.push(`${x},${y},${t},1,0,0:0:0:0:`)
    stroke(255)
    ellipse(c.x, c.y, 15)
    let ratio = (i + 1)/circles.length
    stroke(360 * ratio, 50, 97)
    if(i > 0) line(c.x, c.y, circles[i-1].x, circles[i-1].y)
    // vertex(c.x, c.y)
  }
  // endShape()
  
  // p = createP(out.join('<br>'))
  // p.style('color', 'white')
  
  // noLoop()
}

function makeObjects() {
  objects.html(circles.map((c, i) => {
    let [x, y, t] = [c.x, c.y, startTime + (beatLength / 4) * i].map(n => (round(n)))
    // out.push(`${x},${y},${t},1,0,0:0:0:0:`)
    return `${x},${y},${t},1,0,0:0:0:0:`
  }).join('<br>'))
}