
		this.scrollerWidth	= rect.width;
		this.scrollerHeight	= rect.height;

		this.maxScrollX		= this.wrapperWidth - this.scrollerWidth;

		var limit;
		if ( this.options.infiniteElements ) {
			limit = -this.scrollLimit * this.infiniteElementHeight + this.wrapperHeight;
		}
		this.maxScrollY		= limit !== undefined ? limit : this.wrapperHeight - this.scrollerHeight;
