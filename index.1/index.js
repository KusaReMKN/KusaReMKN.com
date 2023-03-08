'use strict';
class Life {
	constructor(width, height) {
		this.state = new Array([], []);
		this.resize(width, height);
	}
	resize(width, height) {
		[this.width, this.height] = [width, height];
		this.state.length = (this.height);
		for (let i = 0; i < this.height; i++)
			this.state[i] || (this.state[i] = new Array(this.width)),
				this.state[i].length = this.width;
	}
	randomize() {
		for (let i = 0; i < this.height; i++)
			for (let j = 0; j < this.width; j++)
				this.state[i][j] = !Math.round(Math.random());
	}
	cellOf(x, y) {
		return this.state[(y + this.height) % this.height][(x + this.width) % this.width];
	}
	neighbourOf(x, y) {
		let c = 0;
		for (let i = -1; i <= 1; i++)
			for (let j = -1; j <= 1; j++)
				if (j === 0 && i === 0) continue;
				else this.cellOf(x + j, y + i) && c++;
		return c;
	}
	hardCopy(obj) { return JSON.parse(JSON.stringify(obj)); }
	nextGen() {
		let next = new Array(this.height);
		for (let i = 0; i < this.height; i++) next[i] = new Array(this.width);
		for (let i = 0; i < this.height; i++)
			for (let j = 0; j < this.width; j++) {
				let c = this.neighbourOf(j, i);
				next[i][j] = c === 3 || c === 2 && this.state[i][j];
			}
		this.state = next;
	}
	render(ctx) {
		let cw = ctx.canvas.width / this.width;
		let ch = ctx.canvas.height / this.height;
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.fillStyle = 'orange';
		for (let i = 0; i < this.height; i++)
			for (let j = 0; j < this.width; j++)
				this.state[i][j] && ctx.fillRect(j * cw, i * ch, cw, ch);
	}
	putCell(x, y) {
		this.state[(y + this.height) % this.height][(x + this.width) % this.width] = true;
	}
};

window.addEventListener('load', () => {
	const zoom = 2.5;
	const div = 2;
	let canvas = document.querySelector('canvas');
	let ctx = canvas.getContext('2d');
	let frameCount = 0;

	[canvas.width, canvas.height] = [canvas.clientWidth / zoom, canvas.clientHeight / zoom];
	let l = new Life(canvas.width, canvas.height);

	(function AnimationHandler() {
		if (frameCount === 0) l.nextGen();
		l.render(ctx);
		frameCount = (frameCount + 1) % div;
		window.requestAnimationFrame(AnimationHandler);
	})();
	if (window.screen.width > 480)  /* Desktop Only? */
		window.addEventListener('resize', e => {
			[canvas.width, canvas.height] =
				[canvas.clientWidth / zoom, canvas.clientHeight / zoom];
			l.resize(canvas.width, canvas.height);
		});
	document.addEventListener('mousemove', e => {
		e.preventDefault();
		l.putCell(Math.floor(e.pageX / zoom) + 1, Math.floor(e.pageY / zoom) - 1);
		l.putCell(Math.floor(e.pageX / zoom) + 1, Math.floor(e.pageY / zoom) + 1);
		l.putCell(Math.floor(e.pageX / zoom) - 1, Math.floor(e.pageY / zoom) - 1);
		l.putCell(Math.floor(e.pageX / zoom) - 1, Math.floor(e.pageY / zoom) + 1);
		l.putCell(Math.floor(e.pageX / zoom) + 3, Math.floor(e.pageY / zoom) + 0);
		l.putCell(Math.floor(e.pageX / zoom) - 3, Math.floor(e.pageY / zoom) + 0);
		l.putCell(Math.floor(e.pageX / zoom) + 0, Math.floor(e.pageY / zoom) + 3);
		l.putCell(Math.floor(e.pageX / zoom) + 0, Math.floor(e.pageY / zoom) - 3);
	});
	const touchHandler = e => {
		l.putCell(Math.floor(e.touches[0].pageX / zoom) + 1,
			Math.floor(e.touches[0].pageY / zoom) - 1);
		l.putCell(Math.floor(e.touches[0].pageX / zoom) + 1,
			Math.floor(e.touches[0].pageY / zoom) + 1);
		l.putCell(Math.floor(e.touches[0].pageX / zoom) - 1,
			Math.floor(e.touches[0].pageY / zoom) - 1);
		l.putCell(Math.floor(e.touches[0].pageX / zoom) - 1,
			Math.floor(e.touches[0].pageY / zoom) + 1);
		l.putCell(Math.floor(e.touches[0].pageX / zoom) + 3,
			Math.floor(e.touches[0].pageY / zoom) + 0);
		l.putCell(Math.floor(e.touches[0].pageX / zoom) - 3,
			Math.floor(e.touches[0].pageY / zoom) + 0);
		l.putCell(Math.floor(e.touches[0].pageX / zoom) + 0,
			Math.floor(e.touches[0].pageY / zoom) + 3);
		l.putCell(Math.floor(e.touches[0].pageX / zoom) + 0,
			Math.floor(e.touches[0].pageY / zoom) - 3);
	};
	document.addEventListener('touchstart', touchHandler);
	document.addEventListener('touchmove', touchHandler);
	document.addEventListener('touchend', touchHandler);
});
