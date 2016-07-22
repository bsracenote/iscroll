
	_initInfinite: function () {
		var el = this.options.infiniteElements;

		this.infiniteElements = typeof el == 'string' ? document.querySelectorAll(el) : el;
		this.infiniteLength = this.infiniteElements.length;
		this.infiniteMaster = this.infiniteElements[0];
		this.infiniteElementHeight = utils.getRect(this.infiniteMaster).height;
		this.infiniteHeight = this.infiniteLength * this.infiniteElementHeight;

		this.options.cacheSize = this.options.cacheSize || 1000;
		this.scrollLimit = this.options.cacheSize;
		// Allow user to pass in infiniteCacheBuffer
		this.infiniteCacheBuffer = this.options.infiniteCacheBuffer || Math.round(this.options.cacheSize / 4);
		// Setup infiniteCache here instead of resetting on each call.
		this.infiniteCache = {};
		this.options.infiniteLimit = this.options.infiniteLimit || Math.floor(2147483645 / this.infiniteElementHeight);


		//this.infiniteCache = {};
		this.options.dataset.call(this, 0, this.options.cacheSize);

		this.on('refresh', function () {
			var elementsPerPage = Math.ceil(this.wrapperHeight / this.infiniteElementHeight);
			this.infiniteUpperBufferSize = Math.floor((this.infiniteLength - elementsPerPage) / 2);
			this.reorderInfinite();
		});

		this.on('scroll', this.reorderInfinite);
	},

	// TO-DO: clean up the mess
	reorderInfinite: function () {
		var center = -this.y + this.wrapperHeight / 2;

		var minorPhase = Math.max(Math.floor(-this.y / this.infiniteElementHeight) - this.infiniteUpperBufferSize, 0),
			majorPhase = Math.floor(minorPhase / this.infiniteLength),
			phase = minorPhase - majorPhase * this.infiniteLength;

		var top = 0;
		var i = 0;
		var update = [];

		//var cachePhase = Math.floor((minorPhase + this.infiniteLength / 2) / this.infiniteCacheBuffer);
		var cachePhase = Math.floor(minorPhase / this.infiniteCacheBuffer);

		while ( i < this.infiniteLength ) {
			top = i * this.infiniteElementHeight + majorPhase * this.infiniteHeight;

			if ( phase > i ) {
				top += this.infiniteElementHeight * this.infiniteLength;
			}

			if ( this.infiniteElements[i]._top !== top ) {
				this.infiniteElements[i]._phase = top / this.infiniteElementHeight;

				if ( this.infiniteElements[i]._phase < this.options.infiniteLimit ) {
					this.infiniteElements[i]._top = top;
					if ( this.options.infiniteUseTransform ) {
						this.infiniteElements[i].style[utils.style.transform] = 'translate(0, ' + top + 'px)' + this.translateZ;
					} else {
						this.infiniteElements[i].style.top = top + 'px';
					}
					update.push(this.infiniteElements[i]);
				}
			}

			i++;
		}

		if ( this.cachePhase != cachePhase && (cachePhase === 0 || minorPhase - this.infiniteCacheBuffer > 0) ) {
			this.options.dataset.call(this, Math.max(cachePhase * this.infiniteCacheBuffer - this.infiniteCacheBuffer, 0), this.options.cacheSize);
		}

		this.cachePhase = cachePhase;

		this.updateContent(update);
	},

	updateContent: function (els) {
		if ( this.infiniteCache === undefined ) {
			return;
		}

		for ( var i = 0, l = els.length; i < l; i++ ) {
			this.options.dataFiller.call(this, els[i], this.infiniteCache[els[i]._phase]);
		}
	},

	updateCache: function (start, data) {
		var limit;
		var cacheSize = Object.keys(this.infiniteCache).length;
		var firstRun = (cacheSize === 0);
		var lastRun = (cacheSize >= this.options.infiniteLimit && this.scrollLimit !== this.options.infiniteLimit);

		for (var i = 0, l = data.length; i < l; i++) {
			this.infiniteCache[start++] = data[i];
		}

		if (firstRun || lastRun) {
			this.updateContent(this.infiniteElements);
		}

		if (cacheSize > 0 && cacheSize < this.options.cacheSize) {
			// If we have less elements than the cacheSize, fix the scrollLimit so we don't overscroll.
			this.scrollLimit = cacheSize;
		} else if (cacheSize > this.options.infiniteLimit) {
			this.scrollLimit = this.options.infiniteLimit;
		} else {
			this.scrollLimit = (this.scrollLimit > cacheSize) ? this.scrollLimit : cacheSize;
		}

		if (this.options.infiniteElements) {
			limit = -this.scrollLimit * this.infiniteElementHeight + this.wrapperHeight;
		}

		// console.log('cacheSize: ' + cacheSize + ', scrollLimit: ' + this.scrollLimit + ', infiniteLimit: ' + this.options.infiniteLimit);

		this.maxScrollY		= limit !== undefined ? limit : this.wrapperHeight - this.scrollerHeight;

	},
