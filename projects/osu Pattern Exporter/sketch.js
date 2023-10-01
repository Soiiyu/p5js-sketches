let input, hitobjects, timePoints, cs, mapLength, start, end, loadMap, colorOffset, newCombo, gradiant, approachSwitch, followPoint, localCombo, g1, g2, approachOpacity, fadeToggle, fadeStart, fadeEnd;
let hitcircle, overlay, numbers, approach, sliderCanvas;
let playfield, timeline;
let colors = [
  [255, 242, 140],
  [101, 252, 171],
  [148, 120, 255],
  [255, 140, 178],
];
let hitCircleOverlap = 114; // in your skin.ini
let defaultWidth = 149; // regular size, not @2x
let approachMax = 240;
let timelinePadding = 20;
let imgName = 'image'

function preload() {
  hitcircle = loadImage("assets/hitcircle@2x.png");
  overlay = loadImage("assets/hitcircleoverlay@2x.png");
  approach = loadImage("assets/approachcircle.png");
  numbers = new Array(10).fill(1).map((_, i) => loadImage(`assets/default-${i}@2x.png`))
}

function setup() {
  noCanvas()
  playfield = new p5((sketch) => {
    sketch.setup = () => {
      sketch.createCanvas(512 + approachMax, 384 + approachMax)
    }
    sketch.draw = () => {
      console.log(sketch.width, sketch.height)
      sketch.clear();
      sketch.imageMode(CENTER);
      if (!hitobjects) return;
      let r = 109 - 9 * cs;
      let activeObjects = hitobjects.filter(
        (obj) => obj.time >= start.value() && obj.time <= end.value()
      );
      let prev = null
      activeObjects.forEach((obj, i) => {
        let combo = findCombo(newCombo, obj.time);
        // Draw follow points for seperate combo chunks, unless localCombo is checked.
        if (followPoint.checked() && prev && (prev[2] == combo.color || localCombo.checked())) {
          sketch.strokeWeight(6);
          sketch.stroke(color(162, 163, 219, 100));

          // Calculate the direction vector from the previous circle to the current circle
          let direction = createVector(obj.x - prev[0], obj.y - prev[1]);

          // Calculate the length of the direction vector
          let distance = direction.mag();

          // Normalize the direction vector and scale it to be just inside the radius of the current circle
          direction.normalize();
          direction.mult(r / 2); // Adjust this factor for the desired length

          // Calculate the new starting and ending points of the line
          let startX = prev[0] + direction.x;
          let startY = prev[1] + direction.y;
          let endX = obj.x - direction.x;
          let endY = obj.y - direction.y;

          sketch.line(startX, startY, endX, endY);
        }
        prev = [obj.x, obj.y, combo.color]
        let ratio = i / (activeObjects.length - 1);
        let c = gradiant.checked() ? lerpColor(g1.color(), g2.color(), ratio) : color(...colors[combo.color])
        c.setAlpha(approachOpacity.value())
        sketch.strokeWeight(2 * ratio + 2);
        sketch.stroke(c);
        sketch.noFill();
        if (approachSwitch.checked()) {
          let approach = r * ratio + r * 1.2;
          sketch.circle(obj.x, obj.y, approach);
        }
      });
      activeObjects.forEach((obj, i) => {
        let combo = findCombo(newCombo, obj.time);
        let ratio = i / (activeObjects.length - 1);
        let circleAlpha = round(ratio * (255 - fadeStart.value()) + fadeStart.value());

        if (!fadeToggle.checked()) circleAlpha = 255

        // Draw slider
        if (obj.type == 'slider') {
          sliderCanvas = createGraphics(sketch.width, sketch.height)

          sliderCanvas.stroke(82, 84, 128)
          drawSlider(obj.sliderTicks, r, obj.sliderDist)
          sliderCanvas.stroke(25, 22, 30)
          drawSlider(obj.sliderTicks, r * 0.885, obj.sliderDist)

          sketch.tint(255, circleAlpha * 0.75);
          sketch.image(sliderCanvas, sketch.width * 0.5, sketch.height * 0.5)
        }

        // Calculate the combo number as a string
        let comboStr = localCombo.checked() ? (i + 1).toString() : obj.combo.toString();

        // Calculate the spacing between digits based on hitCircleOverlap and the width of the number images (149)
        let spacing = r - (hitCircleOverlap * r / 149); // Scale hitCircleOverlap based on r

        // Calculate the width of each digit image
        let digitWidth = r; // Set digit width to r

        // Calculate the total width needed for all digits
        let totalWidth = (comboStr.length - 1) * spacing;

        // Calculate the starting x-coordinate for the digits
        let startX = obj.x - totalWidth / 2;

        let c = gradiant.checked() ? lerpColor(g1.color(), g2.color(), ratio) : color(...colors[combo.color])

        sketch.tint(red(c), green(c), blue(c), circleAlpha);
        sketch.image(hitcircle, obj.x, obj.y, r, r);
        sketch.tint(255, circleAlpha);
        sketch.image(overlay, obj.x, obj.y, r, r);

        // Display combo numbers over the circle
        for (let j = 0; j < comboStr.length; j++) {
          let digitIndex = int(comboStr.charAt(j)); // Get the digit at position j
          let digitX = startX + j * spacing; // Calculate the x-coordinate for the digit
          let digitY = obj.y; // Use the same y-coordinate as the circle

          // Draw the digit image from the numbers array
          sketch.image(numbers[digitIndex], digitX, digitY, r, r);
        }
      });


      // noLoop();
    }

    sketch.noLoop()
  })

  timeline = new p5((sketch) => {
    sketch.setup = () => {
      sketch.createCanvas(512 + approachMax, 50)
    }

    sketch.draw = () => {
      sketch.background(46, 46, 46)
      
      // Timeline middle line
      const start = createVector(timelinePadding, sketch.height * 0.5)
      const end = createVector(sketch.width - timelinePadding, sketch.height * 0.5)

      sketch.stroke(255, 255, 255)
      sketch.strokeWeight(2)
      sketch.line(start.x, start.y, end.x, end.y)

      if(timePoints) {
        // Preview point
        const previewX = map(timePoints.previewTime, 0, mapLength, start.x, end.x)
        // console.log(timePoints, mapLength, previewX)
        sketch.stroke(255, 233, 0)
        sketch.line(previewX, 0, previewX, sketch.height)
      }
    }
  })

  input = createFileInput(handleFile);
  let button = createButton('Save Image')
  colorOffset = createButton('Color Offset')
  approachOpacity = createSlider(0, 255, 64)
  gradiant = createCheckbox('Gradiant', false)
  localCombo = createCheckbox('Local combo', false)
  followPoint = createCheckbox('Follow Points', false)
  approachSwitch = createCheckbox('Approach Circle', false)
  fadeToggle = createCheckbox('Fade circles', true)
  fadeStart = createSlider(0, 255, 190)
  fadeEnd = createSlider(0, 255, 0)
  createElement('br')
  g1 = createColorPicker('#ffffff')
  g2 = createColorPicker('#000000')
  button.mousePressed(() => saveCanvas(playfield, `${imgName}.png`))
  colorOffset.mousePressed(() => {
    newCombo.map(nc => {
      nc.color = (nc.color + 1) % colors.length
      return nc
    })
    playfield.draw()
  })
  approachOpacity.changed(() => playfield.draw())
  gradiant.changed(() => playfield.draw())
  localCombo.changed(() => playfield.draw())
  followPoint.changed(() => playfield.draw())
  approachSwitch.changed(() => playfield.draw())
  fadeToggle.changed(() => playfield.draw())
  fadeStart.changed(() => playfield.draw())
  fadeEnd.changed(() => playfield.draw())
  // g1.input(() => draw())
  // g2.input(() => draw())

}

function handleFile(file) {
  // decoding base64 data
  let beatmap = atob(file.data.split(",")[1]).split("\r\n");
  imgName = file.name
  cs = parseFloat(
    beatmap
      .join("\n")
      .match(/CircleSize:[0-9.]{1,4}/)
      .toString()
      .split("CircleSize:")[1]
  );

  let previewTime = parseInt(
    beatmap
      .join('\n')
      .match(/PreviewTime: [0-9]{1,8}/)
      .toString()
      .split('PreviewTime: ')[1]
  )

  timePoints = { previewTime }
  //x,y,time,type,_,sliderTicks,1,90
  // getting all hitobjects
  let counter = 1;
  hitobjects = beatmap
    .join("\n")
    .split("[HitObjects]")[1]
    .split("\n")
    .filter((l) => l !== "")
    .map((l) => {
      let [x, y, time, type, _, sliderTicks, __, sliderDist] = l.split(",");
      [x, y, time] = [x, y, time].map((n) => parseInt(n));
      let newCombo = (type & 4) == 4;
      if ((type & 1) == 1) type = "circle";
      else if ((type & 8) == 8) type = "spinner";
      else if ((type & 2) == 2) {
        type = "slider";
        sliderTicks = `${x}:${y}|${sliderTicks.substring(2)}`
      }

      if (newCombo) counter = 1;
      let combo = counter

      x += approachMax / 2;
      y += approachMax / 2;

      counter++
      return { x, y, time, type, combo, newCombo, sliderTicks, sliderDist };
    });
  newCombo = hitobjects.reduce(
    (acc, curr, i) => {
      if (curr.newCombo && !acc.spinner && curr.type !== "spinner") {
        acc.arr.push({ time: curr.time, color: acc.color });
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
  mapLength = hitobjects[hitobjects.length - 1].time
  if (!start) {
    start = createInput('0');
    end = createInput(mapLength.toString());
    loadMap = createButton('Load Section')
    loadMap.mousePressed(playfield.draw)
  } else {
    start.value('0')
    end.value(mapLength.toString())
  }
  // start.input(draw);
  // end.input(draw);
  // draw();
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

// Draw sliders
let lerp2 = (t, p1, p2) => (1 - t) * p1 + t * p2;
let reduce = (t, p1, p2, ...ps) => ps.length > 0 ? [lerp2(t, p1, p2), ...reduce(t, p2, ...ps)] : [lerp2(t, p1, p2)];
let deCasteljau = (t, ps) => ps.length > 1 ? deCasteljau(t, reduce(t, ...ps)) : ps[0];

function drawBezier(x, y, totalDist, targetDist) {
  // console.log(x, y)

  // Set the starting point for the bezier curve
  let x1 = x[0];
  let y1 = y[0];
  moveTo(x1, y1);

  // Loop through the points and draw the bezier curve
  let distance = 0
  for (let t = 0; t <= 1; t += 0.01) {

    let x2 = deCasteljau(t, x);
    let y2 = deCasteljau(t, y);
    distance += dist(x1, y1, x2, y2)
    if (totalDist + distance >= targetDist) break

    sliderCanvas.line(x1, y1, x2, y2);

    x1 = x2;
    y1 = y2;
  }
  return distance
}

function drawSlider(pointsString, radius, targetDist) {
  sliderCanvas.strokeWeight(radius)

  let points = pointsString.split('|')
  let slices = []

  let currentSlice = []
  for (let p of points) {
    // if(currentSlice.length > 0) console.log(currentSlice[currentSlice.length - 1], p)
    if (currentSlice.length > 0 && currentSlice[currentSlice.length - 1] == p) {
      // console.log('new slice')
      slices.push(currentSlice)
      currentSlice = []
    }
    currentSlice.push(p)
  }
  // offset by approachMax
  slices = [...slices.map(p => p.map(pp => pp.split(':').map(n => parseFloat(n) + (approachMax / 2)))), currentSlice.map(p => p.split(':').map(n => parseFloat(n) + (approachMax / 2)))]

  let distance = 0
  for (let slice of slices) {
    let x = slice.map(p => p[0])
    let y = slice.map(p => p[1])
    distance += drawBezier(x, y, distance, targetDist)
  }
  // console.log(slices)
  console.log(distance)
}