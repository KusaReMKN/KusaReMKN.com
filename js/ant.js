'use strict';

const zoom = 4;

const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.inset = '0';
canvas.style.width = '100%';
canvas.style.height = 'auto';
canvas.style.imageRendering = 'pixelated';
canvas.style.zIndex = '-1';
canvas.style.opacity = '0.33';
document.body.append(canvas);

const ctx = canvas?.getContext('2d');
ctx.imageSmoothingEnabled = false;

/**
 * @typedef { object } Complex
 * @property { number } r
 * @property { number } i
 */
/** type { Complex[] } */
const rule = [ ...Array(1+Math.random() * 32 | 0) ].map((_, i) => [
		{ r: +1, i: +0 },
		{ r: +0, i: +1 },
		{ r: -1, i: -0 },
		{ r: -0, i: -1 },
	][Math.random() * 4 | 0]);
/**
 * @typedef { object } Position
 * @property { number } x
 * @property { number } y
 */
/** @type { Map<string, number> } */
const field = new Map();
/** @type { { p: Position, d: Complex }[] } */
const ants = [ ];
/** @type { number } */
const initTurn = Math.random();

/**
 * @param { DOMHighResTimeStamp } ts
 */
function
render(ts)
{
	ctx?.save();
	ctx.globalCompositeOperation = 'destination-in';
	ctx.fillStyle = 'white';
	ctx.globalAlpha = 15/16;
	ctx?.fillRect(0, 0, window.innerWidth/zoom, window.innerHeight/zoom);
	ctx?.restore();
	ants.forEach(e => {
		const rid = field.get(`${e.p.x},${e.p.y}`) || 0;
		const rot = rule[rid];
		field.set(`${e.p.x},${e.p.y}`, (rid+1) % rule.length);

		[ e.d.r, e.d.i ] = [
			e.d.r * rot.r - e.d.i * rot.i | 0,
			e.d.r * rot.i + e.d.i * rot.r | 0,
		];
		[ e.p.x, e.p.y ] = [
			(e.p.x+e.d.r + window.innerWidth/zoom) % (window.innerWidth/zoom) | 0,
			(e.p.y+e.d.i + window.innerHeight/zoom) % (window.innerHeight/zoom) | 0,
		];

		ctx?.save();
		ctx.fillStyle = `oklch(50% 100% ${initTurn + rid/rule.length}turn)`;
		ctx?.fillRect(e.p.x, e.p.y, 1, 1);
		ctx?.restore();
	});

	window.requestAnimationFrame(render);
}
render();

/**
 * @param { PointerEvent } e
 */
function
putAnt(e)
{
	ants.push({
		p: { x: e.clientX/zoom|0, y: e.clientY/zoom|0 },
		d: { ...rule[0] },
	});
}
window.addEventListener('click', putAnt);

/**
 * @param { UIEvent } _ - unused
 */
function
handleResize(_)
{
	canvas.width = window.innerWidth/zoom|0;
	canvas.height = window.innerHeight/zoom|0;
}
window.addEventListener('resize', handleResize);
handleResize();
