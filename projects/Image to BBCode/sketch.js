let img, input, p
let text = '██'
let ignore = [
  [17,15],
  [17,16],
  [22,14],
  [22,15]
].map(p => p.join(','))

function setup() {
  createCanvas(400, 400);
  input = createFileInput(handleFile);
  p = createP('text here')
  pixelDensity(1)
}

function draw() {
  if(img) {
    resizeCanvas(img.width, img.height)
    image(img, 0, 0)
    loadPixels()
    let output = Array(img.height).fill(0).map(x => Array(img.width).fill(0))
    for (let i = 0; i < img.width; i++) {
      for (let j = 0; j < img.height; j++) {
        let index = 4 * j * img.width + i * 4
        let [r,g,b] = [pixels[index],pixels[index+1],pixels[index+2]]
        if(r + g + b >= 254 * 3 && !ignore.includes([i,j].join(','))) [r,g,b] = [42, 34, 38]
        
        
        // output[j][i] = `[color=#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}]${text}[/color]`
        output[j][i] = [r,g,b]
        // console.log(output[j][i], j, i)
      }
    }
    console.log(output)
    background(0)
    for (let i = 0; i < img.width; i++) {
      for (let j = 0; j < img.height; j++) {
        let index = 4 * j * img.width + i * 4
        let [r,g,b] = output[j][i]
        pixels[index] = r
        pixels[index+1] = g
        pixels[index+2] = b
      }
    }
    updatePixels()
    output = output.map(x => x.map(y => `[color=#${y.map(c => c.toString(16).padStart(2, '0')).join('')}]${text}[/color]`).join('')).join('<br>')
    p.html(output)
    
    noLoop()
  }
}

function handleFile(file) {
  img = createImg(file.data, 'mhm')
  img.hide()
}