// Elements and Inputs
let input, saveImage, start, end, loadMap, colorOffset, gradiant, approachSwitch, followPoint, localCombo, g1, g2, approachOpacity, fadeToggle, fadeStart, fadeEnd, overlap;

// Tracking variables
let hitobjects, timePoints, cs, mapLength, newCombo;

// Graphics and images
let hitcircle, overlay, numbers, approach, sliderCanvas;

// Canvases
let playfield, timeline;

// User inputs
const comboColors = [
	[255, 242, 140],
	[101, 252, 171],
	[148, 120, 255],
	[255, 140, 178],
];
const hitCircleOverlap = 114; // in your skin.ini
const defaultWidth = 149; // regular size, not @2x
const approachMax = 240; // Approach circle's max size
const kiaiSize = 0.25 // % of the timeline's height
const breakSize = 0.20

const timelinePadding = 20;
let imgName = 'image'

// Load all the assets
function preload() {
	hitcircle = loadImage("assets/hitcircle@2x.png");
	overlay = loadImage("assets/hitcircleoverlay@2x.png");
	approach = loadImage("assets/approachcircle.png");
	numbers = new Array(10).fill(1).map((_, i) => loadImage(`assets/default-${i}@2x.png`))
}

function setup() {
	// Using Instance mode, create a playfield canvas and a timeline canvas
	noCanvas()
	playfield = new p5((sketch) => {
		sketch.setup = () => {
			sketch.createCanvas(512 + approachMax, 384 + approachMax)
		}

		sketch.draw = () => {
			sketch.clear();
			sketch.imageMode(CENTER);
			if (!hitobjects) return;
			const r = 109 - 9 * cs;

			// Filter and draw objects that are within the start and end times
			const activeObjects = hitobjects.filter(
				(obj) => obj.time >= start.value() && obj.time <= end.value()
			);
			let prev = null
			activeObjects.forEach((obj, i) => {
				const combo = findCombo(newCombo, obj.time);

				// Draw follow points for seperate combo chunks, unless localCombo is checked.
				if (followPoint.checked() && prev && (prev[2] == combo.color || localCombo.checked())) {
					sketch.strokeWeight(6);
					sketch.stroke(color(162, 163, 219, 100));

					// Only draw until reaching the circles
					// Calculate the direction vector from the previous circle to the current circle
					const direction = createVector(obj.x - prev[0], obj.y - prev[1]);

					// Normalize the direction vector and scale it to be just inside the radius of the current circle
					direction.normalize();
					direction.mult(r / 2); // Adjust this factor for the desired length

					// Calculate the new starting and ending points of the line
					const startX = prev[0] + direction.x;
					const startY = prev[1] + direction.y;
					const endX = obj.x - direction.x;
					const endY = obj.y - direction.y;

					sketch.line(startX, startY, endX, endY);
				}

				prev = [obj.x, obj.y, combo.color]

				// Draw approach circle if switch is checked
				if (approachSwitch.checked()) {
					// Fade out the alpha of the earlier approach circles, and set color of either gradiant or current combo color
					const ratio = i / (activeObjects.length - 1);
					const c = gradiant.checked() ? lerpColor(g1.color(), g2.color(), ratio) : color(...comboColors[combo.color])
					c.setAlpha(approachOpacity.value())
					sketch.strokeWeight(2 * ratio + 2);
					sketch.stroke(c);
					sketch.noFill();
					const approach = r * ratio + r * 1.2;
					sketch.circle(obj.x, obj.y, approach);
				}
			});

			// Draw circles and sliders, reverse based on overlap selection
			const orderedObjects = !overlap.checked() ? activeObjects : activeObjects.slice().reverse();
			orderedObjects.forEach((obj, i) => {
				const combo = findCombo(newCombo, obj.time);
				const ratio = overlap.checked() ? (1 - (i / (orderedObjects.length - 1))) : (i / (orderedObjects.length - 1));
				const circleAlpha = fadeToggle.checked() ? round(ratio * (255 - fadeStart.value()) + fadeStart.value()) : 255;

				// Draw slider body in a graphic and add to the playfield
				if (obj.type == 'slider') {
					sliderCanvas = createGraphics(sketch.width, sketch.height)

					// Draw twice, first the outline, then the body
					sliderCanvas.stroke(82, 84, 128)
					drawSlider(obj.sliderTicks, r, obj.sliderDist)
					sliderCanvas.stroke(25, 22, 30)
					drawSlider(obj.sliderTicks, r * 0.885, obj.sliderDist)

					sketch.tint(255, circleAlpha * 0.75);
					sketch.image(sliderCanvas, sketch.width * 0.5, sketch.height * 0.5)
				}

				// Draw hitcircles and overlays 
				const c = gradiant.checked() ? lerpColor(g1.color(), g2.color(), ratio) : color(...comboColors[combo.color])

				sketch.tint(red(c), green(c), blue(c), circleAlpha);
				sketch.image(hitcircle, obj.x, obj.y, r, r);
				sketch.tint(255, circleAlpha);
				sketch.image(overlay, obj.x, obj.y, r, r);

				// Draw combo numbers
				const comboStr = localCombo.checked() ? (i + 1).toString() : obj.combo.toString();

				// Calculate the spacing between digits, total width and starting offset
				const spacing = r - (hitCircleOverlap * r / 149); // Scale hitCircleOverlap based on r
				const totalWidth = (comboStr.length - 1) * spacing;
				const startX = obj.x - totalWidth / 2;

				// Draw combo numbers over the circle
				for (let j = 0; j < comboStr.length; j++) {
					const digitIndex = int(comboStr.charAt(j)); // Get the digit at position j
					const digitX = startX + j * spacing; // Calculate the x-coordinate for the digit

					// Draw the digit image from the numbers array
					sketch.image(numbers[digitIndex], digitX, obj.y, r, r);
				}
			});
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

			if (timePoints) {
				// Timing points
				sketch.strokeWeight(1)
				sketch.stroke(255, 0, 0)
				timePoints.uninherited.forEach(time => {
					const x = map(time, 0, mapLength, start.x, end.x)
					sketch.line(x, 0, x, sketch.height * 0.5)
				})
				sketch.stroke(140, 230, 37)
				timePoints.inherited.forEach(time => {
					const x = map(time, 0, mapLength, start.x, end.x)
					sketch.line(x, 0, x, sketch.height * 0.5)
				})

				// Bookmarks
				sketch.stroke(23, 184, 252)
				timePoints.bookmarks.forEach(time => {
					const x = map(time, 0, mapLength, start.x, end.x)
					sketch.line(x, sketch.height * 0.5, x, sketch.height)
				})

				// Kiai
				sketch.fill(252, 157, 3, 127)
				sketch.noStroke()
				timePoints.kiai.forEach(({startTime, endTime}) => {
					const kiaiStart = map(startTime, 0, mapLength, start.x, end.x)
					const kiaiEnd = map(endTime, 0, mapLength, start.x, end.x)

					sketch.rect(kiaiStart, sketch.height * 0.5 - sketch.height * kiaiSize * 0.5, kiaiEnd - kiaiStart, sketch.height * kiaiSize)
				})

				// Breaks
				sketch.fill(255, 255, 255, 127)
				timePoints.breaks.forEach(({startTime, endTime}) => {
					const breakStart = map(startTime, 0, mapLength, start.x, end.x)
					const breakEnd = map(endTime, 0, mapLength, start.x, end.x)

					sketch.rect(breakStart, sketch.height * 0.5 - sketch.height * breakSize * 0.5, breakEnd - breakStart, sketch.height * breakSize)
				})

				// Preview point
				if (timePoints.previewTime != -1) {
					const previewX = map(timePoints.previewTime, 0, mapLength, start.x, end.x)
					sketch.strokeWeight(2)
					sketch.stroke(255, 233, 0)
					sketch.line(previewX, 0, previewX, sketch.height)
				}
			}
		}
	})

	// Create all the elements and set their functions
	input = createFileInput(handleFile);
	saveImage = createButton('Save Image')
	colorOffset = createButton('Color Offset')
	approachOpacity = createSlider(0, 255, 64)
	gradiant = createCheckbox('Gradiant', false)
	localCombo = createCheckbox('Local combo', false)
	followPoint = createCheckbox('Follow Points', true)
	approachSwitch = createCheckbox('Approach Circle', false)
	overlap = createCheckbox('Overlap', true)
	fadeToggle = createCheckbox('Fade circles', true)
	fadeStart = createSlider(0, 255, 190)
	fadeEnd = createSlider(0, 255, 0)
	createElement('br')
	g1 = createColorPicker('#ffffff')
	g2 = createColorPicker('#000000')

	saveImage.mousePressed(() => saveCanvas(playfield, `${imgName}.png`))
	colorOffset.mousePressed(() => {
		newCombo.map(nc => {
			nc.color = (nc.color + 1) % comboColors.length
			return nc
		})
		playfield.draw()
	})
	approachOpacity.changed(() => playfield.draw())
	gradiant.changed(() => playfield.draw())
	localCombo.changed(() => playfield.draw())
	followPoint.changed(() => playfield.draw())
	approachSwitch.changed(() => playfield.draw())
	overlap.changed(() => playfield.draw())
	fadeToggle.changed(() => playfield.draw())
	fadeStart.changed(() => playfield.draw())
	fadeEnd.changed(() => playfield.draw())
}

function handleFile(file) {
	// decoding base64 data
	const beatmap = atob(file.data.split(",")[1]).split("\r\n");
	imgName = file.name

	// Grab data from the map
	cs = parseFloat(
		beatmap
			.join("\n")
			.match(/CircleSize:[0-9.]{1,4}/)
			.toString()
			.split("CircleSize:")[1]
	);

	timePoints = {
		breaks: [],
		inherited: [],
		uninherited: [],
		kiai: [],
		bookmarks: []
	}

	// Preview points
	timePoints.previewTime = parseInt(
		beatmap
			.join('\n')
			.match(/PreviewTime: [0-9]{1,8}/)
			.toString()
			.split('PreviewTime: ')[1]
	)

	// Bookmarks
	const bookmarksIndex = beatmap.findIndex(line => line.startsWith("Bookmarks: "))
	if (bookmarksIndex !== -1) {
		timePoints.bookmarks = beatmap[bookmarksIndex].substring("Bookmarks: ".length).split(',').map(time => parseInt(time))
	}

	// Breaks and Timing points
	let isBreaks = false
	let isTiming = false
	let kiai = false
	for (let i = 0; i < beatmap.length; i++) {
		switch (beatmap[i]) {
			case "[TimingPoints]":
				isTiming = true
				break
			case "//Break Periods":
				isBreaks = true
				break
			case "":
				if (isTiming) isTiming = false
				if (isBreaks) isBreaks = false
				break
			default:
				if (isBreaks && beatmap[i].startsWith('//')) isBreaks = false
				break
		}

		if (isBreaks && beatmap[i] !== "//Break Periods") {
			const [breakVal, startTime, endTime] = beatmap[i].split(',')
			timePoints.breaks.push({startTime, endTime})
		}

		if (isTiming && beatmap[i] !== "[TimingPoints]") {
			const [time, beatLength, meter, sampleSet, sampleIndex, volume, uninherited, effects] = beatmap[i].split(',')

			// Seperate Inherited and uninherited timing points
			if (uninherited == 1) timePoints.uninherited.push(time)
			else timePoints.inherited.push(time)

			// Kiai
			const prev = timePoints.kiai[timePoints.kiai.length - 1]
			if (effects == 1) {
				if (!prev || !kiai) {
					kiai = true
					timePoints.kiai.push({ startTime: parseInt(time), endTime: undefined })
				} else {
					prev.endTime = parseInt(time)
				}
			} else if (prev && kiai) {
				prev.endTime = parseInt(time)
				kiai = false
			}
		}
	}

	console.log(timePoints)

	// Getting all hitobjects and saving them in the `hitobjects` array
	let counter = 1;
	hitobjects = beatmap
		.join("\n")
		.split("[HitObjects]")[1]
		.split("\n")
		.filter((l) => l !== "")
		.map((l) => {
			let [x, y, time, type, _, sliderTicks, __, sliderDist] = l.split(",");
			[x, y, time] = [x, y, time].map((n) => parseInt(n));

			// Track what type the object is, and if it's a new combo
			let newCombo = (type & 4) == 4;
			if ((type & 1) == 1) type = "circle";
			else if ((type & 8) == 8) type = "spinner";
			else if ((type & 2) == 2) {
				type = "slider";
				sliderTicks = `${x}:${y}|${sliderTicks.substring(2)}`
			}

			if (newCombo) counter = 1;
			let combo = counter

			// Offset object's position by approachMax
			x += approachMax / 2;
			y += approachMax / 2;

			counter++
			return { x, y, time, type, combo, newCombo, sliderTicks, sliderDist };
		});

	// Create an array for new combos and track their color	
	newCombo = hitobjects.reduce(
		(acc, curr, i) => {
			if (curr.newCombo && !acc.spinner && curr.type !== "spinner") {
				acc.arr.push({ time: curr.time, color: acc.color });
				acc.color = (acc.color + 1) % comboColors.length;
			} // filters out non new combo times and spinners
			if (acc.spinner) {
				acc.arr.push({ time: curr.time, color: acc.color });

				acc.color = (acc.color + 1) % comboColors.length;
			} // if the previous note was a spinner (acc.spinner), push current note time as new combo
			acc.spinner = curr.type == "spinner";
			return acc;
		},
		{ arr: [], spinner: false, color: 1 }
	).arr;

	// Create start and end input fields, or update if they exist
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
}

// Find the relevant combo at the given time
function findCombo(newCombo, time) {
	let out = newCombo[0];
	for (let i = newCombo.length - 1; i >= 0; i--) {
		out = newCombo[i];
		if (time >= newCombo[i].time) break;
	}
	return out;
}

// Draw sliders using De Casteljau's Bezier Algorithm
// https://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm
let lerp2 = (t, p1, p2) => (1 - t) * p1 + t * p2;
let reduce = (t, p1, p2, ...ps) => ps.length > 0 ? [lerp2(t, p1, p2), ...reduce(t, p2, ...ps)] : [lerp2(t, p1, p2)];
let deCasteljau = (t, ps) => ps.length > 1 ? deCasteljau(t, reduce(t, ...ps)) : ps[0];

function drawBezier(x, y, totalDist, targetDist) {

	// Set the starting point for the bezier curve
	let x1 = x[0];
	let y1 = y[0];
	moveTo(x1, y1);

	// Loop through the points and draw the bezier curve
	let distance = 0
	for (let t = 0; t <= 1; t += 0.01) {

		let x2 = deCasteljau(t, x);
		let y2 = deCasteljau(t, y);

		// Stop drawing if distance is reached
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

	// Split slices of the slider
	let points = pointsString.split('|')
	let slices = []

	let currentSlice = []
	for (let p of points) {
		if (currentSlice.length > 0 && currentSlice[currentSlice.length - 1] == p) {
			slices.push(currentSlice)
			currentSlice = []
		}
		currentSlice.push(p)
	}
	// Merge slices to an array and offset by approachMax
	slices = [...slices.map(p => p.map(pp => pp.split(':').map(n => parseFloat(n) + (approachMax / 2)))), currentSlice.map(p => p.split(':').map(n => parseFloat(n) + (approachMax / 2)))]

	// Draw each slice seperately while keeping track of the total distance
	let distance = 0
	for (let slice of slices) {
		let x = slice.map(p => p[0])
		let y = slice.map(p => p[1])
		distance += drawBezier(x, y, distance, targetDist)
	}
}