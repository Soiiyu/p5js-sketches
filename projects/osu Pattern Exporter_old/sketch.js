let input, map, hitobjects, cs, start, end, colorOffset, newCombo, gradiant, g1, g2, approachOpacity;
let hitcircle, overlay, approach;
let colors = [
  [255, 242, 140],
  [101, 252, 171],
  [148, 120, 255],
  [255, 140, 178],
];
let approachMax = 240;
let imgName = 'image'

function preload() {
  hitcircle = loadImage("hitcircle@2x.png");
  overlay = loadImage("hitcircleoverlay@2x.png");
  approach = loadImage("approachcircle.png");
}

function setup() {
  let c = createCanvas(512 + approachMax, 384 + approachMax);
  input = createFileInput(handleFile);
  let button = createButton('Save Image')
  colorOffset = createButton('Color Offset')
  approachOpacity = createSlider(0,255,64)
  gradiant = createCheckbox('Gradiant', false)
  g1 = createColorPicker('#ffffff')
  g2 = createColorPicker('#000000')
  button.mousePressed(() => saveCanvas(c, `${imgName}.png`))
  colorOffset.mousePressed(() => {
    newCombo.map(nc => {
      nc.color = (nc.color + 1) % colors.length
      return nc
    })
    draw()
  })
  approachOpacity.changed(() => draw())
  gradiant.changed(() => draw())
  // g1.input(() => draw())
  // g2.input(() => draw())
  
}

function draw() {
  clear();
  imageMode(CENTER);
  if (!hitobjects) return;
  let r = 109 - 9 * cs;
  let activeObjects = hitobjects.filter(
    (obj) => obj.time >= start.value() && obj.time <= end.value()
  );
  activeObjects.forEach((obj, i) => {
    let combo = findCombo(newCombo, obj.time);
    let ratio = i / (activeObjects.length - 1);
    let c = gradiant.checked() ? lerpColor(g1.color(), g2.color(), ratio) : color(...colors[combo.color])
    c.setAlpha(approachOpacity.value())
    strokeWeight(2 * ratio + 2);
    stroke(c);
    noFill();
    let approach = r * ratio + r * 1.2;
    circle(obj.x, obj.y, approach);
  });
  activeObjects.forEach((obj, i) => {
    let combo = findCombo(newCombo, obj.time);
    let ratio = i / (activeObjects.length - 1);
    // circle(obj.x, obj.y, r);
    let c = gradiant.checked() ? lerpColor(g1.color(), g2.color(), ratio) : color(...colors[combo.color])
    let alpha = round(ratio * 55 + 200);
    
    //console.log(alpha);
    tint(c, alpha);
    image(hitcircle, obj.x, obj.y, r, r);
    tint(255, alpha);
    image(overlay, obj.x, obj.y, r, r);
  });
  noLoop();
}

function handleFile(file) {
  // decoding base64 data
  let map = atob(file.data.split(",")[1]).split("\r\n");
  imgName = file.name
  cs = parseFloat(
    map
      .join("\n")
      .match(/CircleSize:[0-9.]{1,4}/)
      .toString()
      .split("CircleSize:")[1]
  );
  // getting all hitobjects
  hitobjects = map
    .join("\n")
    .split("[HitObjects]")[1]
    .split("\n")
    .filter((l) => l !== "")
    .map((l) => {
      let [x, y, time, type] = l.split(",");
      [x, y, time] = [x, y, time].map((n) => parseInt(n));
      let newCombo = (type & 4) == 4;
      if ((type & 1) == 1) type = "circle";
      else if ((type & 8) == 8) type = "spinner";
      else if ((type & 2) == 2) type = "slider";

      x += approachMax/2;
      y += approachMax/2;

      return { x, y, time, type, newCombo };
    });
  newCombo = hitobjects.reduce(
    (acc, curr, i) => {
      if (curr.newCombo && !acc.spinner && curr.type !== "spinner") {
        acc.arr.push({ time: curr.time, color: acc.color});
        acc.color = (acc.color + 1) % colors.length;
      } // filters out non new combo times and spinners
      if (acc.spinner) {
        // acc.arr.push({ time: curr.time, color: colors[acc.color] });
        acc.arr.push({ time: curr.time, color: acc.color });

        acc.color = (acc.color + 1) % colors.length;
      } // if the previous note was a spinner (acc.spinner), push current note time as new combo
      acc.spinner = curr.type == "spinner";
      return acc;
    },
    { arr: [], spinner: false, color: 1 }
  ).arr;
  console.log(newCombo);
  start = createInput("0");
  end = createInput(hitobjects[hitobjects.length - 1].time.toString());
  start.input(draw);
  end.input(draw);
  draw();
  console.log(hitobjects);
}

function findCombo(newCombo, time) {
  let out = newCombo[0];
  for (let i = newCombo.length - 1; i >= 0; i--) {
    out = newCombo[i];
    if (time >= newCombo[i].time) break;
  }
  return out;
}
