function setup() {
  createCanvas(512, 384);
}

function draw() {
  background(51);
  
  noFill()
  stroke(200)
  // drawBezier("0:0|100:100|200:300|300:300|400:200|200:100", 50)
  drawSlider("410:237|414:252|411:271|411:271|264:278|264:278|194:282|176:348|176:348|75:377|-9:361|-84:228|-3:-76|242:-106|600:-35|536:274|503:355|503:355|258:365", 50)
  // drawSlider("384:380|312:376|312:376|312:292|312:292|224:288|224:288|220:376|220:376|132:376|132:376|128:316|128:256|128:256|128:168|140:96|140:96|68:96|68:96|56:184|56:252|56:252|128:256|128:256|128:316|132:376|132:376|220:376|220:376|224:288|224:288|312:292|312:292|312:376|312:376|384:380|384:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|396:268|392:152|392:152|420:116|412:68|368:36|368:36|320:-36|212:-40|152:0|140:96|140:96|152:0|212:-40|320:-36|368:36|368:36|412:68|420:116|392:152|392:152|420:116|412:68|368:36|368:36|412:68|420:116|392:152|392:152|396:268|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|396:268|392:152|392:152|328:180|232:180|232:104|232:104|232:48|304:28|368:36|368:36|412:68|420:116|392:152|392:152|328:180|232:180|232:104|232:104|232:48|304:28|368:36|368:36|412:68|420:116|392:152|392:152|396:268|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|312:376|312:376|312:292|312:292|224:288|224:288|220:376|220:376|132:376|132:376|128:316|128:256|128:256|128:168|140:96|140:96|128:168|128:256|128:256|128:316|132:376|132:376|220:376|220:376|224:288|224:288|312:292|312:292|312:376|312:376|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380|384:380|384:380|368:380|368:380", 50)
  // drawSlider("0:0|100:100|200:300|300:300|400:200|200:100", 50)
  // drawBezier("410:237|414:252|411:271", 50)
  // drawBezier("411:271|264:278", 50)
  // drawBezier("264:278|194:282|176:348", 50)
  //  drawBezier("176:348|75:377|-9:361|-84:228|-3:-76|242:-106|600:-35|536:274|503:355", 50)
  // drawBezier("503:355|258:365", 50)
  noLoop()
}


// Example: lerp(0.5, 0.0, 1.0) == 0.5
let lerp2 = (t, p1, p2) => (1 - t) * p1 + t * p2;

// Example: reduce(0.5, ...[0.0, 1.0, 2.0, 3.0]) == [0.5, 1.5, 2.5]
let reduce = (t, p1, p2, ...ps) => ps.length > 0 ? [lerp2(t, p1, p2), ...reduce(t, p2, ...ps)] : [lerp2(t, p1, p2)];

// Example: deCasteljau(0.5, [0.0, 1.0, 2.0, 3.0]) == 1.5
let deCasteljau = (t, ps) => ps.length > 1 ? deCasteljau(t, reduce(t, ...ps)) : ps[0];

function drawBezier(x, y) {
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

    line(x1, y1, x2, y2);
    
    distance += dist(x1, y1, x2, y2)
    x1 = x2;
    y1 = y2;
  }
  return distance
}

function drawSlider(pointsString, radius) {
  strokeWeight(radius)
  
  let points = pointsString.split('|')
  let slices = []
  
  let currentSlice = []
  for(let p of points) {
    // if(currentSlice.length > 0) console.log(currentSlice[currentSlice.length - 1], p)
    if(currentSlice.length > 0 && currentSlice[currentSlice.length - 1] == p) {
      // console.log('new slice')
      slices.push(currentSlice)
      currentSlice = []
    }
    currentSlice.push(p)
  }
  
   slices = [...slices.map(p => p.map(pp => pp.split(':').map(n => parseFloat(n)))), currentSlice.map(p => p.split(':').map(n => parseFloat(n)))]
  
  let distance = 0
  for(let slice of slices) {
    let x = slice.map(p => p[0])
    let y = slice.map(p => p[1])
    distance += drawBezier(x, y)
  }
  // console.log(slices)
  console.log(distance)
}




