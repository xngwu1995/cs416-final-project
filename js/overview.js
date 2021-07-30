
const MARGIN1 = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH1 = 800 - MARGIN1.LEFT - MARGIN1.RIGHT
const HEIGHT1 = 500 - MARGIN1.TOP - MARGIN1.BOTTOM

const svg1 = d3.select("#overview-chart-area").append("svg")
  .attr("width", WIDTH1 + MARGIN1.LEFT + MARGIN1.RIGHT)
  .attr("height", HEIGHT1 + MARGIN1.TOP + MARGIN1.BOTTOM)

const g1 = svg1.append("g")
  .attr("transform", `translate(${MARGIN1.LEFT}, ${MARGIN1.TOP})`)

let time = 0
let interval
let formattedData

// Tooltip
const tip = d3.tip()
  .attr('class', 'd3-tip')
	.html(d => {
		let text = `<strong>Country:</strong> <span style='color:red;text-transform:capitalize'>${d.country}</span><br>`
		text += `<strong>Continent:</strong> <span style='color:red;text-transform:capitalize'>${d.continent}</span><br>`
		text += `<strong>Life Expectancy:</strong> <span style='color:red'>${d3.format(".2f")(d.life_exp)}</span><br>`
		text += `<strong>GDP Per Capita:</strong> <span style='color:red'>${d3.format("$,.0f")(d.income)}</span><br>`
		text += `<strong>Population:</strong> <span style='color:red'>${d3.format(",.0f")(d.population)}</span><br>`
		return text
	})
g1.call(tip)

// Scales
const x1 = d3.scaleLog()
	.base(10)
	.range([0, WIDTH1])
	.domain([142, 150000])
const y1 = d3.scaleLinear()
	.range([HEIGHT1, 0])
	.domain([0, 90])
const area = d3.scaleLinear()
	.range([25*Math.PI, 1500*Math.PI])
	.domain([2000, 1400000000])
const continentColor = d3.scaleOrdinal(d3.schemePastel1)

// Labels
const xLabel1 = g1.append("text")
	.attr("y", HEIGHT1 + 50)
	.attr("x", WIDTH1 / 2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("GDP Per Capita ($)")
const yLabel1 = g1.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", -40)
	.attr("x", -170)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Life Expectancy (Years)")
const timeLabel = g1.append("text")
	.attr("y", HEIGHT1 - 10)
	.attr("x", WIDTH1 - 40)
	.attr("font-size", "40px")
	.attr("opacity", "0.4")
	.attr("text-anchor", "middle")
	.text("1800")

// X Axis
const xAxisCall1 = d3.axisBottom(x1)
	.tickValues([400, 4000, 40000])
	.tickFormat(d3.format("$"));
g1.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT1})`)
	.call(xAxisCall1)

// Y Axis
const yAxisCall1 = d3.axisLeft(y1)
g1.append("g")
	.attr("class", "y axis")
	.call(yAxisCall1)

const continents = ["europe", "asia", "americas", "africa"]

const legend = g1.append("g")
	.attr("transform", `translate(${WIDTH1 - 10}, ${HEIGHT1 - 125})`)

continents.forEach((continent, i) => {
	const legendRow = legend.append("g")
		.attr("transform", `translate(0, ${i * 20})`)

	legendRow.append("rect")
    .attr("width", 10)
    .attr("height", 10)
		.attr("fill", continentColor(continent))

	legendRow.append("text")
    .attr("x", -10)
    .attr("y", 10)
    .attr("text-anchor", "end")
    .style("text-transform", "capitalize")
    .text(continent)
})

d3.json("data/data.json").then(function(data){
	// clean data
	formattedData = data.map(year => {
		return year["countries"].filter(country => {
			const dataExists = (country.income && country.life_exp)
			return dataExists
		}).map(country => {
			country.income = Number(country.income)
			country.life_exp = Number(country.life_exp)
			return country
		})
	})
	// first run of the visualization
	update1(formattedData[0])
})
drawAnnotation();

function step() {
	// at the end of our data, loop back
	time = (time < 214) ? time + 1 : 0
	update1(formattedData[time])
}

$("#play-button")
	.on("click", function() {
		const button = $(this)
		if (button.text() === "Play") {
			button.text("Pause")
			interval = setInterval(step, 100)
		}
		else {
			button.text("Play")
			clearInterval(interval)
		}
	})

$("#reset-button")
	.on("click", () => {
		time = 0
		update1(formattedData[0])
	})

$("#continent-select")
	.on("change", () => {
		update1(formattedData[time])
	})

$("#date-slider").slider({
	min: 1800,
	max: 2014,
	step: 1,
	slide: (event, ui) => {
		time = ui.value - 1800
		update1(formattedData[time])
	}
})
function drawAnnotation() {
	var annotation1 = svg1.append('g');
	annotation1.append('text')
	  .attr('x', 110)
	  .attr('y', 360)
	  .classed('annotation', true)
	  .text('Asian countries circle have a larger size, it means that these countries have more population.');
  }

function update1(data) {
	// standard transition time for the visualization
	const t = d3.transition()
		.duration(100)

	const continent = $("#continent-select").val()

	const filteredData = data.filter(d => {
		if (continent === "all") return true
		else {
			return d.continent == continent
		}
	})

	// JOIN new data with old elements.
	const circles = g1.selectAll("circle")
		.data(filteredData, d => d.country)

	// EXIT old elements not present in new data.
	circles.exit().remove()

	// ENTER new elements present in new data.
	circles.enter().append("circle")
		.attr("fill", d => continentColor(d.continent))
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide)
		.merge(circles)
		.transition(t)
			.attr("cy", d => y1(d.life_exp))
			.attr("cx", d => x1(d.income))
			.attr("r", d => Math.sqrt(area(d.population) / Math.PI))

	// update the time label
	timeLabel.text(String(time + 1800))

	$("#year")[0].innerHTML = String(time + 1800)
	$("#date-slider").slider("value", Number(time + 1800))
}
