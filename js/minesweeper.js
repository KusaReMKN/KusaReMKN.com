'use strict';

/**
 * a map cell
 *
 * @class
 */
class Cell {
	constructor() {
		/**
		 * true if this cell is opened
		 *
		 * @member @type { boolean }
		 */
		this.isOpened = false;

		/**
		 * true if this cell is flagged
		 *
		 * @member @type { boolean }
		 */
		this.isFlagged = false;

		/**
		 * true if this cell is a mine
		 *
		 * @member @type { boolean }
		 */
		this.isMine = false;

		/**
		 * number of mines around
		 *
		 * @member @type { number }
		 */
		this.numMines = -1;

		/**
		 * number of flags around
		 *
		 * @member @type { number }
		 */
		this.numFlag = 0;
	}
};

/**
 * Mine Sweeper -- the game loved by everyone.
 *
 * @class
 */
export default class MineSweeper {
	/**
	 * true if initialization is required
	 *
	 * @member @type { boolean }
	 */
	#reqInit;

	/**
	 * true if in the game
	 *
	 * @member @type { boolean }
	 */
	#gaming;

	/**
	 * true if lost game
	 *
	 * @member @type { boolean }
	 */
	#lost;

	/**
	 * width of the map
	 *
	 * @member @type { number }
	 */
	#width;

	/**
	 * height of the map
	 *
	 * @member @type { number }
	 */
	#height;

	/**
	 * number of mines to be placed
	 *
	 * @member @type { number }
	 */
	#mines;

	/**
	 * number of closed cells
	 *
	 * @member @type { number }
	 */
	#numClosed;

	/**
	 * game map
	 *
	 * @member @type { Cell[][] }
	 */
	#map;

	/**
	 * callback function for rendering
	 *
	 * @param { string[][] } arg map information
	 * @param { boolean } lost true if lost game
	 * @param { boolean } game true if in the game
	 * @param { number } ts time when called function
	 * @returns { void } nothing
	 */
	#renderer = (arg, lost, game, ts) => (void 0);

	/**
	 * call the renderer
	 *
	 * @param { number } ts time when called function
	 * @param { MineSweeper } self MineSweeper object itself (this)
	 * @returns { void } nothing
	 */
	#update(ts, self) {
		self.#renderer(self.getMap(), self.#lost, self.#gaming, ts);
	}

	/**
	 * get map information
	 *
	 * @return { string[][] } map information
	 */
	getMap() {
		return this.#map.map(r => r.map(e => {
			if (e.isFlagged)
				return 'F';
			if (!e.isOpened && !(this.#lost && e.isMine))
				return '#';
			if (e.isMine)
				return 'X';
			else
				return String(e.numMines);
		}));
	}

	/**
	 * start the new game
	 *
	 * @param { number } w width of the new map
	 * @param { number } h height of the new map
	 * @param { number } m number of mines to be placed
	 * @returns { void } nothing
	 * @throws { Error } when too many mines are placed
	 */
	start(w, h, m) {
		if (w * h - 9 < m)
			throw new Error('Too many mines!');
		this.#reqInit = true;
		this.#lost = false;
		this.#gaming = false;
		this.#width = w;
		this.#height = h;
		this.#mines = m;
		this.#numClosed = w * h;
		this.#map = [...Array(h)].map(_ => [...Array(w)].map(_ => new Cell()));
		window.requestAnimationFrame(_ => this.#update(_, this));
	}

	/**
	 * place mines on the map
	 *
	 * @param { number } x x-coordinate of the cell to be opened
	 * @param { number } y y-coordinate of the cell to be opened
	 * @returns { void } nothing
	 */
	#placeMines(x, y) {
		/**
		 * generate the first permutation
		 *
		 * The permutation to be generate is [ 0, 1, ..., n-2, n-1 ].
		 * Performance: O(n).
		 *
		 * @param { number } n length of the permutation
		 * @returns { number[] } generated permutation
		 */
		function
		generatePermutation(n) {
			return [...Array(n)].map((_, i) => i);
		};

		/**
		 * shffle the elements of the array
		 *
		 * The array itself passed as an argument is manipulated.
		 * All elements of the array must be initialized.
		 * Performance: O(n).
		 *
		 * @template T
		 * @param { T[] } arr array to be shuffled
		 * @returns { T[] } shuffled array
		 */
		function
		shuffleArray(arr) {
			/**
			 * generate a random integer
			 *
			 * The range of random integer to be generated is [0, n).
			 * Performance: O(1).
			 *
			 * @param { number } n range of random integers to be generated
			 * @returns { number } generated random integer
			 */
			function
			generateRandomInt(n) {
				return Math.random() * n | 0;
			}

			arr.forEach((e, i, a) => {
				const j = generateRandomInt(a.length);
				a[i] = a[j];
				a[j] = e;
			});
			return arr;
		}

		/**
		 * calculate the Chebyshev distance between two points
		 *
		 * @param { number } x1 x-coordinate of the one point
		 * @param { number } y1 y-coordinate of the one point
		 * @param { number } x2 x-coordinate of the another point
		 * @param { number } y2 y-coordinate of the another point
		 * @returns { number } value of calculated distance
		 */
		function
		chebyshev(x1, y1, x2, y2) {
			return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))
		}

		const arr = shuffleArray(generatePermutation(this.#width * this.#height));
		let cnt = 0;
		arr.some(e => {
			const a = e % this.#width;
			const b = e / this.#width | 0;
			if (chebyshev(x, y, a, b) > 1) {
				this.#map[b][a].isMine = true;
				cnt++;
			}
			return !(cnt < this.#mines);
		});
	}

	/**
	 * count mines around
	 *
	 * @returns { void } nothing
	 */
	#countMines() {
		this.#map.forEach((r, y) => r.forEach((e, x) => {
			if (!e.isMine) {
				e.numMines = 0;
				for (let i = -1; i <= 1; i++)
					for (let j = -1; j <= 1; j++)
						if (this.#map[y+i] && this.#map[y+i][x+j]?.isMine)
							e.numMines++;
			}
		}));
	}

	/**
	 * open the surrounding cells
	 *
	 * @param { number } x x-coordinate of the cell to be opened
	 * @param { number } y y-coordinate of the cell to be opened
	 * @returns { void } nothing
	 */
	#openAround(x, y) {
		for (let i = -1; i <= 1; i++)
			for (let j = -1; j <= 1; j++)
				if (this.#map[y+i]?.[x+j]?.isOpened === false)
					this.open(x+j, y+i, true);
	}

	/**
	 * auto opening
	 *
	 * @param { number } x x-coordinate of the cell to be opened
	 * @param { number } y y-coordinate of the cell to be opened
	 * @returns { void } nothing
	 */
	auto(x, y) {
		if (this.#map[y][x].isOpened)
			if (this.#map[y][x].numFlag === this.#map[y][x].numMines)
				this.#openAround(x, y);
		window.requestAnimationFrame(_ => this.#update(_, this));
	}

	/**
	 * open the specified cell
	 *
	 * @param { number } x x-coordinate of the cell to be opened
	 * @param { number } y y-coordinate of the cell to be opened
	 * @param { true | undefined } suppress true if suppress rendering
	 * @returns { void } nothing
	 */
	open(x, y, suppress) {
		/* Is initialization required? */
		if (this.#reqInit) {
			this.#placeMines(x, y);
			this.#countMines();
			this.#reqInit = false;
			this.#gaming = true;
		}
		/* Nothing to do if this cell is flagged or opened, or game is over */
		if (this.#map[y][x].isFlagged || this.#map[y][x].isOpened || !this.#gaming) {
			if (!suppress)
				window.requestAnimationFrame(_ => this.#update(_, this));
			return;
		}
		/* Open this cell */
		this.#map[y][x].isOpened = true;
		this.#numClosed--;
		/* game is over if open a mine */
		if (this.#map[y][x].isMine) {
			this.#lost = true;
			this.#gaming = false;
		}
		/* game is over if sweep all mines */
		if (this.#numClosed === this.#mines)
			this.#gaming = false;
		/* Open in a chain */
		if (this.#map[y][x].numMines === 0)
			this.#openAround(x, y);
		if (!suppress)
			window.requestAnimationFrame(_ => this.#update(_, this));
	}

	/**
	 * flag the specified cell
	 *
	 * @param { number } x x-coordinate of the cell to be flagged
	 * @param { number } y y-coordinate of the cell to be flagged
	 * @returns { void } nothing
	 */
	flag(x, y) {
		if (this.#map[y][x].isOpened || !this.#gaming)
			return;
		this.#map[y][x].isFlagged = !this.#map[y][x].isFlagged;
		const diff = this.#map[y][x].isFlagged ? +1 : -1;
		for (let i = -1; i <= 1; i++)
			for (let j = -1; j <= 1; j++)
				if ((i || j) && this.#map[y+i] && this.#map[y+i][x+j])
					this.#map[y+i][x+j].numFlag += diff;
		window.requestAnimationFrame(_ => this.#update(_, this));
	}

	/**
	 * specify the rendering function
	 *
	 * @param { (arg: string[][], lost: boolean, game: boolean, ts: number) => void } fn
	 * callback function for rendering
	 * @returns { void } nothing
	 */
	render(fn) {
		this.#renderer = fn;
	}

	/**
	 * request rendering
	 *
	 * @returns { void } nothing
	 */
	draw() {
		window.requestAnimationFrame(_ => this.#update(_, this));
	}
};
