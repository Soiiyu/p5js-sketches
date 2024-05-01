let title = "Your Title";
let diff = "Your Diff";
let id = "Your ID";
let rank = '12,345'
let totalpp = '7,890'
let bgUrl = "https://assets.ppy.sh/beatmaps/815758/covers/cover.jpg";
let bg, userPic;
let username, pp

let scoreUrl = "https://osu.ppy.sh/scores/osu/2896489084"

let rectMask
const mapSize = {
	width: 550,
	height: 130
}

const scoreID = document.getElementById('score-id')
const loadScoreButton = document.getElementById('load-score')
const loadManuallyButton = document.getElementById('load-manually')
const toggleManual = document.getElementById('toggle-manual')
const manualTab = document.getElementById('manual')

const player = document.getElementById("player");
const profilePic = document.getElementById("profile-pic");
const rankElement = document.getElementById("rank");
const totalPP = document.getElementById("total-pp");
const playPP = document.getElementById("play-pp");
const songTitle = document.getElementById("song-Title");
const difficulty = document.getElementById("difficulty");
const backgroundUrl = document.getElementById("background-url");

loadScoreButton.onclick = load
loadManuallyButton.onclick = loadManually
toggleManual.onclick = () => {
	manualTab.classList.toggle('invisible')
}

async function load() {
	console.log('loading')
	try {
		console.log(scoreUrl.match(/osu.ppy.sh\/scores\/osu\/\d+/))
		if(scoreID.value.match(/^\d+$/)) scoreID.value = `https://osu.ppy.sh/scores/osu/${scoreID.value}`
		scoreUrl = scoreID.value
		if (!scoreUrl.match(/osu.ppy.sh\/scores\/osu\/\d+/)) return console.log('invalid score url')
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ data: scoreUrl, type: 'score' })
		}
		console.log(options)
		const fetchedScore = (await fetch('/fetchScore', options).then(res => res.json()))
		const { score } = fetchedScore

		username = score.user.username
		pp = score.pp
		title = score.beatmapset.title
		diff = score.beatmap.version
		id = score.beatmap_id

		player.value = username
		profilePic.value = score.user.avatar_url
		playPP.value = pp
		songTitle.value = title
		difficulty.value = diff
		backgroundUrl.value = score.beatmapset.covers.cover

		options.body = JSON.stringify({ data: score.user.id, type: 'player' })
		const fetchedUser = await fetch('/fetchScore', options).then(res => res.json())

		rank = fetchedUser.rank
		totalpp = Math.round(parseFloat(fetchedUser.totalpp))

		rankElement.value = rank
		totalPP.value = totalpp

		console.log(fetchedScore, score)
		console.log(fetchedUser, rank, totalpp)
		bg = await createImg(score.beatmapset.covers.cover, "map bg", null, drawLoadedImg)

		userPic = await createImg(score.user.avatar_url, "user pfp", null, drawLoadedImg)
		console.log('loaded')
	} catch (error) {
		console.log('Error loading score or images', error)
	}
}

async function loadManually() {
	console.log('loading manual inputs')
	try {
		username = player.value
		pp = playPP.value
		title = songTitle.value
		diff = difficulty.value

		rank = rankElement.value
		totalpp = totalPP.value

		if(backgroundUrl.value.match(/^\d+$/)) backgroundUrl.value = `https://assets.ppy.sh/beatmaps/${backgroundUrl.value}/covers/cover.jpg`
		// if(!backgroundUrl.value.match(/assets.ppy.sh\/beatmaps\/\d+\/covers\/cover.jpg/)) return console.log('invalid map url')
		bg = await createImg(backgroundUrl.value, "map bg", null, drawLoadedImg)

		if(profilePic.value.match(/^\d+$/)) profilePic.value = `https://a.ppy.sh/${profilePic.value}`
		userPic = await createImg(profilePic.value, "user pfp", null, drawLoadedImg)
	} catch (error) {
		console.log('Error loading manual score or images', error)
	}
}

function preload() {
	kulimParkRegular = loadFont('assets/KulimPark-Regular.ttf');
	kulimParkBold = loadFont('assets/KulimPark-Bold.ttf');
}

function setup() {
	const canvas = createCanvas(650, 300);
	canvas.width = 650
	canvas.height = 300
	drawingContext.shadowOffsetX = 0;
	drawingContext.shadowOffsetY = 0;
	drawingContext.shadowBlur = 25;
	drawingContext.shadowColor = 'black';

	// Fixes double canvas resolution, but looks worse.
	// pixelDensity(1)

	rectMask = createGraphics(234, 132)

	noLoop(); // Since p5.js continuously loops by default, but your Node.js code runs once
	// load()
}

function draw() {
	if (!bg || !userPic) return
	// background(127)
	clear()
	console.log(title, diff, id, bg);

	let padding = 26;

	stroke('#9ea0d0');
	strokeWeight(20);
	// let cornerRadius = 20;
	// rectMask.rect(153, 114, 234, 132, cornerRadius)
	// rect(0, 0, 234, 132, cornerRadius);
	// rect(153, 114, 234, 132, cornerRadius);


	// let [width, height] = [width, height];
	let [targetWidth, targetHeight] = [bg.width, bg.height];

	let expectedWidth = (bg.height / mapSize.height) * mapSize.width;
	let expectedHeight = (bg.width / mapSize.width) * mapSize.height;

	if (expectedHeight < bg.height) targetHeight = expectedHeight;
	else if (expectedWidth < bg.width) targetWidth = expectedWidth;

	let targetY = (bg.height - targetHeight) / 2;
	let targetX = (bg.width - targetWidth) / 2;

	console.log(bg.width, bg.height, targetX, targetY, targetWidth, targetHeight, expectedWidth, expectedHeight)

	// bg.mask(rectMask)
	const [bgX, bgY] = [width - mapSize.width - 50, height - mapSize.height - 90]
	image(bg, bgX, bgY, mapSize.width, mapSize.height, targetX, targetY, targetWidth, targetHeight);

	// Darken bg image
	fill(0, 0, 0, 50)
	noStroke()
	rect(bgX, bgY, mapSize.width, mapSize.height)

	image(userPic, bgX + 15, bgY + 15, mapSize.height - 30, mapSize.height - 30)

	stroke('#333a8a')
	strokeWeight(2)
	fill('white')
	textFont(kulimParkBold)
	textSize(30)
	textAlign(LEFT, BOTTOM)
	text(username, bgX + mapSize.height, bgY + mapSize.height * 0.5, 250)

	textSize(48)
	textAlign(RIGHT, BOTTOM)
	text(`${Math.round(pp)}pp`, bgX + mapSize.width - 15, bgY + mapSize.height * 0.5 + 24)

	textSize(24)
	textAlign(CENTER, BOTTOM)

	const trimmedTitle = trimText(title, 24, mapSize.width)
	text(trimmedTitle, bgX, bgY + mapSize.height + 24 + 15, mapSize.width)

	fill('#c5d0e7')
	textSize(18)
	textAlign(LEFT, TOP)
	text(`#${rank} • ${totalpp}pp`, bgX + mapSize.height, bgY + mapSize.height * 0.5, 250)

	textFont(kulimParkRegular)
	textSize(18)
	textAlign(CENTER, BOTTOM)

	const trimmedDiff = trimText(diff, 18, mapSize.width)
	text(trimmedDiff, bgX, bgY + mapSize.height + 24 + 10 + 30, mapSize.width)

	stroke('#4a3768');
	strokeWeight(4);
	textSize(24);
	textAlign(RIGHT, CENTER);
	fill('white');
	text(title, width - padding, 288, width - padding * 2);

	let idOffset = padding;

	textSize(18);
	text(`[${diff}]`, width - idOffset, 319, width - idOffset * 2);

	textSize(30);
	textAlign(CENTER, CENTER);
	stroke('#4a3768');
	strokeWeight(8);
	// text(id, 270, 190, width - padding * 2);

	let filename = `${title.replace(/[\?:\/\\\"\*\<\>]/g, '')} [${diff.replace(/[\?:\/\\\"\*\<\>]/g, '')}] ${id.toString().replace(/[\/\\]/, '')}.png`;
	// saveCanvas(filename, 'png');
	console.log(`finished creating ${filename}\nvegas pos: x: -547, y: 500\nfor 1920x1080`);
}

function drawLoadedImg(img) {
	console.log('image loaded')
	img.hide()
	draw()
	return img
}

function trimText(text, fontSize, maxWidth) {
	console.log(text, fontSize, maxWidth)
	textSize(fontSize)
	let output = text
	if (textWidth(text) < maxWidth) return output

	const suffixLength = textWidth('...')
	while (textWidth(output) >= maxWidth - suffixLength) {
		output = output.split('')
		output.pop()
		output = output.join('').trim()
		console.log(output)
	}
	return output + '...'
}