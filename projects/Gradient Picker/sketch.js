let count = 5
let colors = Array(count).fill(1),
    inputs = Array(count).fill(1);

function setup() {
  createCanvas(400, 100);
  colors = colors.map(() => createColorPicker('#ffffff'));
  createP('<br>');
  inputs = inputs.map(() => createInput(''));
  
  colors.forEach((c, i) => c.changed(() => {
    let col = c.color()
    let [r,g,b] = [red(col), green(col), blue(col)].map(n => hex(n, 2));
    inputs[i].value(`#${r}${g}${b}`)
  }));
  
  inputs.forEach((inp, i) => inp.changed(() => {
    colors[i].value(inp.value())
  }))
}

let index = 0
let currColor = 'white'
function draw() {
  background(51);
  let w = width / count
  noStroke()
  for(let i = 0; i < count; i++) {
    for(let j = 0; j < w; j++) {
      let x = i * w + j
      let start = colors[i].color()
      let end = colors[i == 4 ? 0 : i + 1].color()
      let c = lerpColor(start, end, j / w)
      if(x == index) {
        currColor = c
      }
      fill(c)
      rect(x, 0, x, height * 0.5)
    }
  }
  
  textAlign(CENTER, CENTER)
  textSize(24)
  textStyle(BOLD);
  fill(currColor)
  text('Cupcake', width * 0.5, 75)
  
  index++
  if(index >= width) index = 0
}