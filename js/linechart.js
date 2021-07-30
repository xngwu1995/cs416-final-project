
const MARGIN = { LEFT: 100, RIGHT: 100, TOP: 50, BOTTOM: 100 }
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#line-chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

// time parsers/formatters
const parseTime = d3.timeParse("%Y")
const formatTime = d3.timeFormat("%Y")
// for tooltip
const bisectDate = d3.bisector(d => d.Year).left

// add the line for the first time
g.append("path")
	.attr("class", "line")
	.attr("fill", "none")
	.attr("stroke", "grey")
	.attr("stroke-width", "3px")

// axis labels
const xLabel = g.append("text")
	.attr("class", "x axisLabel")
	.attr("y", HEIGHT + 50)
	.attr("x", WIDTH / 2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Time")
const yLabel = g.append("text")
	.attr("class", "y axisLabel")
	.attr("transform", "rotate(-90)")
	.attr("y", -75)
	.attr("x", -150)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Price ($)")

// scales
const x = d3.scaleTime().range([0, WIDTH])
const y = d3.scaleLinear().range([HEIGHT, 0])

// axis generators
const xAxisCall = d3.axisBottom()
const yAxisCall = d3.axisLeft()
	.ticks(6)

// axis groups
const xAxis = g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)
const yAxis = g.append("g")
	.attr("class", "y axis")

// event listeners
$("#Country-select").on("change", update2)

$("#var-select").on("change", update2)

// add jQuery UI slider
$("#date-line").slider({
	range: true,
	max: parseTime("2014").getTime(),
	min: parseTime("1800").getTime(),
	step: 31536000, // one year
	values: [
		parseTime("1800").getTime(),
		parseTime("2014").getTime()
	],
	slide: (event, ui) => {
		$("#dateLabel1").text(formatTime(new Date(ui.values[0])))
		$("#dateLabel2").text(formatTime(new Date(ui.values[1])))
		update2()
	}
})

d3.json("data/China vs US.json").then(data => {
	// prepare and clean data
	filteredData = {}
	Object.keys(data).forEach(Country => {
		filteredData[Country] = data[Country]
		.filter(d => {
			return !(d["Population"] == null)
		})
			.map(d => {
				d["Population"] = Number(d["Population"])
				d["Income"] = Number(d["Income"])
				d["Life_Exp"] = Number(d["Life_Exp"])
				d["Year"] = parseTime(d["Year"])
				return d
			})
	})
	// run the visualization for the first time
	update2()
})

function update2() {
	const t = d3.transition().duration(1000)

	// filter data based on selections
	const Country = $("#Country-select").val()
	const yValue = $("#var-select").val()
	const sliderValues = $("#date-line").slider("values")
	const dataTimeFiltered = filteredData[Country].filter(d => {
		return ((d.Year >= sliderValues[0]) && (d.Year <= sliderValues[1]))
	})

	// update scales
	x.domain(d3.extent(dataTimeFiltered, d => d.Year))
	y.domain([
		d3.min(dataTimeFiltered, d => d[yValue]), 
		d3.max(dataTimeFiltered, d => d[yValue])
	])

	// update axes
	xAxisCall.scale(x)
	xAxis.transition(t).call(xAxisCall)
	yAxisCall.scale(y)
	yAxis.transition(t).call(yAxisCall)

	// clear old tooltips
	d3.select(".focus").remove()
	d3.select(".overlay").remove()

	/******************************** Tooltip Code ********************************/

	const focus = g.append("g")
		.attr("class", "focus")
		.style("display", "none")

	focus.append("line")
		.attr("class", "x-hover-line hover-line")
		.attr("y1", 0)
		.attr("y2", HEIGHT)

	focus.append("line")
		.attr("class", "y-hover-line hover-line")
		.attr("x1", 0)
		.attr("x2", WIDTH)

	focus.append("circle")
		.attr("r", 7.5)

	focus.append("text")
		.attr("x", 15)
		.attr("dy", ".31em")

	g.append("rect")
		.attr("class", "overlay")
		.attr("width", WIDTH)
		.attr("height", HEIGHT)
		.on("mouseover", () => focus.style("display", null))
		.on("mouseout", () => focus.style("display", "none"))
		.on("mousemove", mousemove)

		drawAnnotation3();
	function mousemove() {
		const x0 = x.invert(d3.mouse(this)[0])
		const i = bisectDate(dataTimeFiltered, x0, 1)
		const d0 = dataTimeFiltered[i - 1]
		const d1 = dataTimeFiltered[i]
		const d = x0 - d0.Year > d1.Year - x0 ? d1 : d0
		focus.attr("transform", `translate(${x(d.Year)}, ${y(d[yValue])})`)
		focus.select("text").text(d[yValue])
		focus.select(".x-hover-line").attr("y2", HEIGHT - y(d[yValue]))
		focus.select(".y-hover-line").attr("x2", -x(d.Year))
	}
	function drawAnnotation3() {
		var annotation = svg.append('g');
		annotation.append('text')
		  .attr('x', 10)
		  .attr('y', 20)
		  .classed('annotation', true)
		  .text('Which country will have a better performance in the future?')
		annotation.append('line')
		  .attr('x1', 400)
		  .attr('x2', 700)
		  .attr('y1', 20)
		  .attr('y2', 50)
		  .classed('annotation', true);

	  }
	/******************************** Tooltip Code ********************************/

	// Path generator
	line = d3.line()
		.x(d => x(d.Year))
		.y(d => y(d[yValue]))

	// Update our line path

		line = d3.line()
		.x(d => x(d.Year))
		.y(d => y(d[yValue]))
		g.select(".line")
		.transition(t)
		.attr("d", line(dataTimeFiltered))


	// Update y-axis label
	const newText = (yValue === "Population") ? "Population " 
		: (yValue === "Income") ? "Income GDP per Capital ($)" 
			: "Life Exp(year)"
	yLabel.text(newText)
}

