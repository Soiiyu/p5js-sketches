let potato, alpha, pic, input

function preload() {
  potato = loadImage('potato.jpg')
  alpha = loadImage('alpha3.png')
  pic = loadImage('linus.png')
}

function setup() {
  createCanvas(alpha.width, alpha.height);
  background(220);
  noTint()
  image(potato, 0, 0)
  input = createFileInput(file => {
    if (file.type == 'image') {
      //pic = createImg(file.data, '')
      loadImage(file.data, img => {
        //pic.hide()
        img.resize(824, 438)
        img.loadPixels();
        for (let x = 0; x < img.width; x++) {
          for (let y = 0; y < img.height; y++) {
            let i = 4 * (x + y * img.width)
            let r = red(img.pixels[i]);
            let g = green(img.pixels[i + 1]);
            let b = blue(img.pixels[i + 2]);
            //console.log(r,g,b, (r + b + g) / 3)
            //img.pixels[i] = color(54)
            let a = (r + g + b) / 3
            img.set(x, y, color(a, img.pixels[i + 3]-a))
          }
        }
        img.updatePixels()
        img.mask(alpha)
        

        background(220);
        noTint()
        image(potato, 0, 0)
        tint(238, 208, 135)
        //tint(238, 208, 135, 186)
        image(img, 0, 0, width, height)
      })

    } else return console.log("This isn't an image")
  })


}

function draw() {
  // background(220);
  // image(alpha, 0, 0)
  // image(pic, 0, 0, width, height)
  // rect(mouseX-width, mouseY, width*2, 2)
  // rect(mouseX, mouseY-height, 2, height*2)
}

// function mouseClicked() {
//   console.log(mouseX, mouseY)
// }