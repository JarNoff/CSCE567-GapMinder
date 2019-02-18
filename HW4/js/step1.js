/*
*   Name: Jaret Noffsinger
*   CSCE 567 GapMinder Clone
*   Assignment 4
*   2/20/2019
*/



var margin = { left:80, right:20, top:50, bottom:100 };
var height = 500 - margin.top - margin.bottom,
    width = 800 - margin.left - margin.right;

var g = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left +
            ", " + margin.top + ")");

var time = 0;

// Scales
var x = d3.scaleLog()
    .base(10)
    .range([0, width])
    .domain([142, 150000]);
    console.log(x)
var y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, 90]);
    console.log(y)
var area = d3.scaleLinear()
    .range([25*Math.PI, 1500*Math.PI])
    .domain([2000, 1400000000]);
    console.log(area)
var continentColor = d3.scaleOrdinal(d3.schemePastel1);

// Labels
var xLabel = g.append("text")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("GDP Per Capita ($)");
var yLabel = g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -40)
    .attr("x", -170)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Life Expectancy (Years)")
var timeLabel = g.append("text")
    .attr("y", height -10)
    .attr("x", width - 40)
    .attr("font-size", "40px")
    .attr("opacity", "0.4")
    .attr("text-anchor", "middle")
    .text("1800");

// X Axis
var xAxisCall = d3.axisBottom(x)
    .tickValues([400, 4000, 40000])
    .tickFormat(d3.format("$"));
g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height +")")
    .call(xAxisCall);

// Y Axis
var yAxisCall = d3.axisLeft(y)
    .tickFormat(function(d){ return +d; });
g.append("g")
    .attr("class", "y axis")
    .call(yAxisCall);

var legend = g.append("g")
              .attr("transform", "translate(" + (width - 10) + "," + (height - 125) + ")");

var continents = ["Asia", "Africa", "Americas", "Europe"];

continents.forEach(function(continent, i) {
    var legendrow = legend.append("g")
                          .attr("transform", "translate(0, " + (i*20) + ")");
    
    legendrow.append("rect")
             .attr("width", 10)
             .attr("height", 10)
             .attr("fill", continentColor(continent));
    
    legendrow.append("text")
             .attr("x", -10)
             .attr("y", 10)
             .attr("text-anchor", "end")
             .style("text-transform", "capitalize")
             .text(continent);
});

d3.json("data/data.json").then(function(data) {

	//clean data - remove null values and map data to years
	const formattedData = data.map(function(year) {
			return year["countries"].filter(function(country) {
				var dataExists = (country.income && country.life_exp);
				return dataExists;
			}).map(function(country) {
				country.income = +country.income;
				country.life_exp = +country.life_exp;
				return country;
			})
	});

  //Set the interval to update the data for the circles

  d3.interval(function(d) {

    //if the time variable exceeds 214, make sure it gets reset
    //We have data for years 1800-2014
    if (time == 215)
    {
      time = 0;
    }

    createCircles(formattedData);
  }, 400);

});


//This function creates the circles with the appropriate attributes
function createCircles(formattedData)
{
  //Select all circles and set the data to the correct data
  //from the current year
	var circles = g.selectAll("circle").
	             data(formattedData[time], function(d) {
		               return d.country;
	             });

  //Transition the circles and set new attributes
	circles.transition()
     .duration(200)
		 .attr("class", "enter")
		 .attr("fill", function(d) {
			 return continentColor(d.continent); })
		 .attr("cy", function(d){ return y(d.life_exp); })
		 .attr("cx", function(d){ return x(d.income) })
		 .attr("r", function(d) {
			 return Math.sqrt(area(d.population) / Math.PI) });

  //Use the magic enter function
  circles.enter()
         .append("circle");

  circles.exit()
         .remove();

  //Set the current year label to the correct year
  var currentYear = 1800 + time;
  timeLabel.text(currentYear);
  //Increment time variable by one year
  time = time + 1;
}
