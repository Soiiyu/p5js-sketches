let diameter = 850;

let pride, overlay, clone, temp;
let mask;

let pos,
  imgScale = 1,
  rotation = 0;

let upload, edit, scaleSlider, rotateSlider, overlaySlider, resetPos, customUpload;
let scaleText, rotateText, overlayText;

function preload() {
  pride = loadImage("pride-template.png");
  overlay = pride
  temp = loadImage("temp.png");
}

function setup() {
  createCanvas(1000, 1000);
  mask = createGraphics(width, height);
  pos = createVector(width * 0.5, height * 0.5);

  upload = createFileInput(handleFile);
  edit = createCheckbox("Edit Mode", false);
  scaleText = createDiv("Scale");
  scaleSlider = createSlider(0, 10, 1, 0.1);
  rotateText = createDiv("Rotate");
  rotateSlider = createSlider(-PI, PI, 0, 0.1);
  overlayText = createDiv("Overlay Scale");
  overlaySlider = createSlider(0, width, diameter, 1);

  resetPos = createButton("Reset Position");
  customUpload = createFileInput(handleCustom)

  resetPos.mousePressed(() => {
    pos.x = width * 0.5;
    pos.y = height * 0.5;
    imgScale = 1;
    scaleSlider.value(1);
    rotateSlider.value(0);
    overlaySlider.value(850);
    overlay = pride
  });
  // console.log(overlay)
}

let offX;
let offY;
let changeOffset = true;

function mouseDragged() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    if (changeOffset) {
      offX = mouseX - pos.x;
      offY = mouseY - pos.y;
      changeOffset = false;
    }
    // if (edit.checked() && dist(pos.x, pos.y, mouseX, mouseY) < 150) {
    if (edit.checked()) {
      pos.x = mouseX - offX;
      pos.y = mouseY - offY;
    }
  }
}

function mouseReleased() {
  changeOffset = true;
}

function mouseWheel(event) {
  if (edit.checked()) {
    imgScale -= 0.1 * Math.sign(event.delta);
    scaleSlider.value(imgScale);
  }
}

function draw() {
  if (edit.checked()) {
    scaleSlider.show();
    scaleText.show();
    rotateText.show();
    rotateSlider.show();
    overlayText.show();
    overlaySlider.show();
    customUpload.show()
  } else {
    scaleSlider.hide();
    scaleText.hide();
    rotateText.hide();
    rotateSlider.hide();
    overlayText.hide();
    overlaySlider.hide();
    customUpload.hide()
  }
  diameter = overlaySlider.value();
  clear();
  mask.background("rgba(0, 0, 0, 1)");
  mask.erase();
  // mask.fill('rgba(0, 0, 0, 1)')
  let ratio = temp.width / temp.height;
  let wr = temp.width > temp.height ? ratio : 1;
  let hr = temp.height > temp.width ? ratio : 1;
  // let w = (diameter * (width / 1000)) / wr
  // let h = (diameter * (width / 1000)) / hr
  let w = diameter * (width / 1000),
    h = diameter * (width / 1000);

  mask.ellipse(width * 0.5, height * 0.5, w, h);
  mask.noErase();
  (clone = overlay.get()).mask(mask);

  // noFill()
  // stroke()
  // ellipse(width / 2, height/2, diameter * (width / 1000))

  imageMode(CENTER);
  push();
  translate(pos.x, pos.y);
  // let p = createVector(pos.x + width * 0.5, pos.y + height * 0.5)
  rotate(rotateSlider.value(), pos);
  image(
    temp,
    0,
    0,
    wr * width * scaleSlider.value(),
    hr * height * scaleSlider.value()
  );
  pop();

  // if (edit.checked()) {
  //   fill(92, 154, 247);
  //   strokeWeight(4);
  //   stroke(255);
  //   ellipse(pos.x, pos.y, 20, 20);
  // }

  image(clone, width * 0.5, height * 0.5, width, height);
  if (!edit.checked()) dropShadow(diameter, 0.5)
  else {
    stroke(0)
    strokeWeight(4)
    noFill()
    ellipse(width * 0.5, height * 0.5, width, height)
  }
  // image(mask, width/2, height/2)
}

function handleFile(file) {
  if (file.type == "image") {
    temp = createImg(file.data, "");
    temp.hide();
  }
}

function handleCustom(file) {
  if (file.type == "image") {
    // overlay = createImg(file.data, "");
    overlay = loadImage(file.data)
    // console.log(img)
    overlay.hide();
  }
}

function dropShadow(dia, opacity = 0.5) {
  if(parseFloat(opacity.toFixed(5)) <= 0) return
  noFill()
  stroke(0, 0, 0, 255 * opacity)
  ellipse(width * 0.5, height * 0.5, dia+=2)
  dropShadow(dia, opacity * 0.9)
 
}
