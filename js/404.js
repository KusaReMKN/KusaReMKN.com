'use strict';

import MineSweeper from '/js/minesweeper.js';

async function
fetchIconChip(url) {
	const img = await new Promise((res, rej) => {
		const img = new Image();
		img.addEventListener('load', _ => res(img));
		img.addEventListener('error', e => rej(e));
		img.src = url;
	});
	const cv = new OffscreenCanvas(img.width, img.height);
	const ctx = cv.getContext('2d', { willReadFrequently: true });
	ctx.drawImage(img, 0, 0);
	const res = [];
	for (let i = 0; i < cv.height; i += cv.width)
		res.push(ctx.getImageData(0, i, cv.width, cv.height));
	return res;
}

function
imageData2ImageBitmap(imageData) {
	const cv = new OffscreenCanvas(imageData.width, imageData.height);
	const ctx = cv.getContext('2d');
	ctx.putImageData(imageData, 0, 0);
	return cv.transferToImageBitmap();
}

const iconChipUrl = '/img/minesweeper.webp';
const chips = (await fetchIconChip(iconChipUrl)).map(e => imageData2ImageBitmap(e));
const chipTab = {
	'1': chips[0], '2': chips[1], '3': chips[2], '4': chips[3],
	'5': chips[4], '6': chips[5], '7': chips[6], '8': chips[7],
	'F': chips[8], 'X': chips[9], '#': chips[10], '.': chips[11],
};

const m = new MineSweeper();
const cellSize = chips[0].width;

const ctx = mine.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;


let startAt = null;
let endAt = null;

let width = null;
let height = null;
let mines = null;

function
mouseHandler(e) {
	const x = e.offsetX / cellSize | 0;
	const y = e.offsetY / cellSize | 0;
	const map = m.getMap();

	m.draw();
	switch (e.type) {
	case 'mousedown':
		/* FALLTHROUGH */
	case 'mousemove':
		if (e.buttons & 0x01)	/* left button */
			window.requestAnimationFrame(_ => {
				mineface.textContent = '😮';
				if (map[y]?.[x] === '#') {
					const cx = cellSize * x;
					const cy = cellSize * y;
					ctx.drawImage(chipTab['.'], cx, cy);
				}
			});
		if (e.buttons & 0x04)	/* center button */
			window.requestAnimationFrame(_ => {
				mineface.textContent = '😮';
				for (let i = -1; i <= 1; i++)
					for (let j = -1; j <= 1; j++)
						if (map[y+i]?.[x+j] === '#') {
							const cx = cellSize * (x + j);
							const cy = cellSize * (y + i);
							ctx.drawImage(chipTab['.'], cx, cy);
						}
			});
		break;
	case 'mouseup':
		switch (e.button) {
		case 0:	/* left button */
			if (!startAt) {
				startAt = window.performance.now();
				endAt   = null;
			}
			m.open(x, y);
			break;
		case 1:	/* center button */
			m.auto(x, y);
			break;
		case 2:	/* right button */
			m.flag(x, y);
		default:
			/* Nothing to do */
		}
		break;
	default:
		/* Nothing to do */
	}
}
mine.addEventListener('mousedown',  mouseHandler);
mine.addEventListener('mouseleave', mouseHandler);
mine.addEventListener('mousemove',  mouseHandler);
mine.addEventListener('mouseup',    mouseHandler);

mine.addEventListener('contextmenu', e => e.preventDefault());

let timerId = null;
let timerEvent = null;
function
touchHandler(e)
{
	const rect = e.target.getBoundingClientRect();
	const x = (e.changedTouches[0].clientX - rect.x) / cellSize | 0;
	const y = (e.changedTouches[0].clientY - rect.y) / cellSize | 0;
	const map = m.getMap();

	console.debug(e.type, x, y);
	m.draw();
	switch (e.type) {
	case 'touchstart':
		window.requestAnimationFrame(_ => mineface.textContent = '😮');
		timerEvent = e;
		timerId = setTimeout(() => {
			m.flag(x, y);
			e.preventDefault();
			timerEvent = null;
			timerId = null;
		}, 200);
		break;
	case 'touchmove':
		if (timerEvent)
			timerEvent.preventDefault();
		clearTimeout(timerId);
		timerId = null;
		break;
	case 'touchend':
		clearTimeout(timerId);
		timerId = null;
		if (map[y]?.[x] !== '#')
			m.auto(x, y);
		break;
	default:
		/* Nothing to do */
	}
}
mine.addEventListener('touchstart', touchHandler);
mine.addEventListener('touchcancel', touchHandler);
mine.addEventListener('touchmove', touchHandler);
mine.addEventListener('touchend', touchHandler);

mine.addEventListener('dblclick', e => e.preventDefault());

function
updateClock(now)
{
	if (!startAt)
		minetime.textContent = '';
	else
		minetime.textContent = String(((endAt || now) - startAt) / 1000 | 0);
	minetime.textContent = minetime.textContent.padStart(4, '0');

	window.requestAnimationFrame(updateClock);
}
window.requestAnimationFrame(updateClock);

function
mineRate(n)
{
	if (n <= 256)
		return 5/32;
	if (n <= 512)
		return 5*n/32768 + 15/128;
	if (n <= 1024)
		return 25/128;
	if (n <= 4096)
		return 25*n/1572864 + 275/1536;
	else
		return 125/512;
}

function
faceHandler(_)
{
	startAt = endAt = null;

	width  = document.body.clientWidth / cellSize | 0;
	height = Math.min(document.body.clientHeight * .6 / cellSize | 0, width);
	mines  = mineRate(width * height) * width * height | 0;

	mine.width  = width  * cellSize;
	mine.height = height * cellSize;
	m.start(width, height, mines);
}
mineface.addEventListener('click', faceHandler);
faceHandler(null);

function
renderer(map, lost, game, now)
{
	ctx.clearRect(0, 0, width * cellSize, height * cellSize);

	let flags = 0;
	map.forEach((r, y) => r.map((e, x) => {
		const cx = cellSize * x;
		const cy = cellSize * y;

		/* opened cell or closed cell */
		ctx.drawImage(chipTab[/[#F]/.test(e) ? '#' : '.'], cx, cy);
		/* flagged cell */
		if (e === 'F') {
			ctx.drawImage(chipTab['F'], cx, cy);
			flags++;
		}
		/* numbered cell */
		if (e !== '0')
			ctx.drawImage(chipTab[e], cx, cy);
	}));
	if (!game && !endAt)
		endAt = now;

	const zeros = String(mines).length;
	mineflag.textContent = String(mines - flags).padStart(zeros, '0') + '/' + mines;
	mineface.textContent = lost ? '😵' : game ? '🙂' : '🤩';
}
m.render(renderer);

/* enable mine sweeper */
para.textContent += '\n代わりにマインスイーパがあります。';
minearea.style.display = 'block';
