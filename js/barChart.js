

class BarChart {
	

	constructor(_parentElement, _year, _data) {
		this.parentElement = _parentElement
		this.year = _year
		this.flag = true
		this.data = _data[_year]
		this.newText = ""
		this.initVis()
	}
	// initVis method - set up static parts of our visualization.
	initVis() {
		const vis = this
		vis.newText = (vis.parentElement === "#chart-area1") ? "Asian has the largest amount of population in the world through 1800 to 2014 " 
			: "Americas total GDP increases a lot through 1800 to 2014 if we consider population."		
		vis.MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
		vis.WIDTH = 600 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT
		vis.HEIGHT = 400 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM
	

	
		vis.svg = d3.select(vis.parentElement).append("svg")
	  	.attr("width", vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT)
	  	.attr("height", vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM)
	
		vis.g = vis.svg.append("g")
		.attr("transform", `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`)
	
	// X label
	vis.g.append("text")
	  .attr("class", "x axis-label")
	  .attr("x", vis.WIDTH / 2)
	  .attr("y", vis.HEIGHT + 60)
	  .attr("font-size", "20px")
	  .attr("text-anchor", "middle")
	  .text("Continent")
	
	// Y label
	vis.yLabel = vis.g.append("text")
	  .attr("class", "y axis-label")
	  .attr("x", - (vis.HEIGHT / 2))
	  .attr("y", -60)
	  .attr("font-size", "20px")
	  .attr("text-anchor", "middle")
	  .attr("transform", "rotate(-90)")
	
	vis.x = d3.scaleBand()
	  .range([0, vis.WIDTH])
	  .paddingInner(0.3)
	  .paddingOuter(0.2)
	
	vis.y = d3.scaleLinear()
	  .range([vis.HEIGHT, 0])
	
	vis.xAxisGroup = vis.g.append("g")
	  .attr("class", "x axis")
	  .attr("transform", `translate(0, ${vis.HEIGHT})`)
	
	vis.yAxisGroup = vis.g.append("g")
	  .attr("class", "y axis")
	  d3.interval(() => {
		vis.flag = !vis.flag
		update(vis.data)
	  }, 1000)
	  update(vis.data)


	
	function update(data) {
		vis.value = vis.flag ? "Population" : "Income"
	  
		vis.x.domain(data.map(d => d.Continent))
		vis.y.domain([0, d3.max(data, d => d[vis.value])])
	  
		vis.xAxisCall = d3.axisBottom(vis.x)
		vis.xAxisGroup.call(vis.xAxisCall)
		  .selectAll("text")
			.attr("y", "10")
			.attr("x", "-5")
			.attr("text-anchor", "end")
			.attr("transform", "rotate(-40)")
	  
		vis.yAxisCall = d3.axisLeft(vis.y)
		  .ticks(3)
		  .tickFormat(d => (d/1000000000) + "B")
		vis.yAxisGroup.call(vis.yAxisCall)
	  
		// JOIN new data with old elements.
		vis.rects = vis.g.selectAll("rect")
		  .data(vis.data)

		// EXIT old elements not present in new data.
		vis.rects.exit().remove()
	  
		// UPDATE old elements present in new data.
		vis.rects
		  .attr("y", d => vis.y(d[vis.value]))
		  .attr("x", (d) => vis.x(d.Continent))
		  .attr("width", vis.x.bandwidth)
		  .attr("height", d => vis.HEIGHT - vis.y(d[vis.value]))

		// ENTER new elements present in new data.  
		vis.rects.enter().append("rect")
		  .attr("y", d => vis.y(d[vis.value]))
		  .attr("x", (d) => vis.x(d.Continent))
		  .attr("width", vis.x.bandwidth)
		  .attr("height", d => vis.HEIGHT - vis.y(d[vis.value]))
		  .attr("fill", "grey")
		drawAnnotation();

		const text = vis.flag ? "Population " : "Total GDB ($)"
		vis.yLabel.text(text)
		function drawAnnotation() {
			var annotation = vis.svg.append('g');
			annotation.append('text')
			  .attr('x', 10)
			  .attr('y', 390)
			  .classed('annotation', true)
			  .text(vis.newText);
		  }
	  }
	}}