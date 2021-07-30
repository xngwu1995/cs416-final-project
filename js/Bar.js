
let barChart1
let barChart2



d3.json("data/summary.json").then(data => {
	filteredData = {}
	Object.keys(data).forEach(year => {
		filteredData[year] = data[year]
      .filter(d => {
        return !(d["Continent"] == null)
      }).map(d => {
				d["Population"] = Number(d["Population"])
				d["Income"] = Number(d["Income"])
				return d
			})
	})

	barChart1 = new BarChart("#chart-area1", "1800", filteredData)
	barChart2 = new BarChart("#chart-area2", "2014", filteredData)
})

