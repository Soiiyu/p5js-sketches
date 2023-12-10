// Based on Daniel Shiffman's Polynomial Regression with TensorFlow.js project

// https://thecodingtrain.com/CodingChallenges/105-polynomial-regression-tfjs.htmll
// https://youtu.be/tIXDik5SGsI

let input, withScore, withoutScore, predictions

let xs = [];
let ys = [];

let a, b, c, d

const normalizeRank = {
	min: 1,
	max: 100000
	// max: 1000000
}
const normalizeScore = {
	min: 0,
	max: 10000000
}

const learningRate = 0.2
const optimizer = tf.train.adam(learningRate)

function setup() {
	createCanvas(512, 384);
	background(0);

	a = tf.variable(tf.scalar(random(1)))
	b = tf.variable(tf.scalar(random(1)))
	c = tf.variable(tf.scalar(random(1)))
	d = tf.variable(tf.scalar(random(1)))

	input = createFileInput(handleFile);
}

function draw() {
	if (xs.length > 0) {
		background(0);
		stroke(255);
		strokeWeight(6);
		xs.forEach((x, i) => point(map(x, 0, 1, 0, width), map(ys[i], 0, 1, height, 0)));

		optimizer.minimize(() => loss(predict(xs), tf.tensor1d(ys)));

		const curveX = [];
		for(let x = 0; x <= 1; x += 0.05) {
			curveX.push(x);
		}

		const tfys = tf.tidy(() => predict(curveX));
		let curveY = tfys.dataSync();
		tfys.dispose();

		beginShape();
		noFill();
		stroke(255)
		strokeWeight(2)
		curveX.forEach((cx, i) => {
			const x = map(cx, 0, 1, 0, width);
			const y = map(curveY[i], 0, 1, height, 0);
			vertex(x, y);
		})
		endShape();

		strokeWeight(8);
		stroke(255, 80, 80);
		predictions = predict(withoutScore.map(({ rank }) => map(rank, 0, normalizeRank.max, 0, 1))).dataSync()
		predictions.forEach((p, i) => point(map(withoutScore[i].rank, normalizeRank.min, normalizeRank.max, 0, width), map(p, 0, 1, height, 0)))
	}
}

function mousePressed() {
	const normalizedPredictions = predictions.map(p => map(p, 0, 1, normalizeScore.min, normalizeScore.max))
	const estimatedScores = withoutScore.map((player, i) => {
		player.score = normalizedPredictions[i]
		player.estScore = true
		return player
	})
	console.table([...withScore, ...estimatedScores].sort((a, b) => b.score - a.score))
}

function loss(pred, lables) {
	return pred.sub(lables).square().mean();
}

function predict(x) {
	const xs = tf.tensor1d(x)
	
	// squared
	// const ys = xs.square().mul(a)
	// 			.add(xs.mul(b))
	// 			.add(c);

	// cubed
	const ys = xs.pow(tf.scalar(3)).mul(a)
				.add(xs.square().mul(b))
				.add(xs.mul(c))
				.add(d);

	return ys
}

function handleFile(file) {
	console.log(file)
	const { data } = file

	withScore = data.filter(({ rank, score }) => score !== undefined && rank <= normalizeRank.max)
	withoutScore = data.filter(({ rank, score }) => score === undefined && rank <= normalizeRank.max)

	xs = withScore.map(({ rank }) => map(rank, normalizeRank.min, normalizeRank.max, 0, 1))
	ys = withScore.map(({ score }) => map(score, normalizeScore.min, normalizeScore.max, 0, 1))

	console.log(xs, ys)
}

function predictScore(rank) {
	return map(predict([map(rank, 0, normalizeRank.max, 0, 1)]).dataSync()[0], 0, 1, normalizeScore.min, normalizeScore.max)
}