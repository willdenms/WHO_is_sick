class Choropleth {

    constructor(countryData) {


    }

    drawMap(disease) {
        //clear current map


        queue()
            .defer(d3.json, "data/world_countries.json")
            // .defer(d3.tsv, "data/stubData.tsv")
            .await(ready);

        function ready(error, data) {
            d3.csv("data/WHO_transpose.csv", function (error, whoData) {



                var selection = d3.select("#globalMap").selectAll("svg").remove();

                let format = d3.format(",");

// Set tooltips
                let tip = d3.tip()
                    .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function (d) {
                        return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" +
                            "<strong>Mortality Per Capita * 10 mil: </strong><span class='details'>" + format((d.disease / d.population)* 10000000000) + "<br></span>" +
                            "<strong>Population: </strong><span class='details'>" + format(d.population) + "<br></span>" +
                            "<strong>GDP: </strong><span class='details'>" + "$" + format(d.GDP) + "<br></span>";
                    });

                let margin = {top: -100, right: 0, bottom: 0, left: 0},
                    width = 1000 - margin.left - margin.right,
                    height = 600 - margin.top - margin.bottom;

                let colors = ["#ffe6e6", "#ffcccc","#ffb3b3","#ff8080", "#ff4d4d","#ff1a1a","#e60000","#b30000","#800000"];

                let color = d3.scaleThreshold()
                    .domain([100,1000,5000,10000,50000,100000,500000,1000000,5000000,15000000])
                    // .domain([1, 50, 100, 200, 400, 800, 1000, 1500, 1800, 2000])
                    // .range(["rgb(247,251,255)", "rgb(222,235,247)", "rgb(198,219,239)", "rgb(158,202,225)", "rgb(107,174,214)", "rgb(66,146,198)", "rgb(33,113,181)", "rgb(8,81,156)", "rgb(8,48,107)", "rgb(3,19,43)"]);
                    .range(colors);

                var path = d3.geoPath();


                let headerSelection = d3.select("#selection").select("h").remove();
                headerSelection = d3.select("#selection").append("h").text(disease);


                let svg = d3.select("#globalMap")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append('g')
                    .attr('class', 'map');

                let projection = d3.geoMercator()
                    .scale(130)
                    .translate([width / 2, height / 1.5]);

                path = d3.geoPath().projection(projection);

                svg.call(tip);

                // console.log("this should be the disease " + disease);

                let diseaseByCountryName = {};
                let populationByCountryName = {};
                let gdpByCountryName = {};

                // console.log("this is the dataCSV: " + self.data);

                //WHO data parsing
                whoData.forEach(function (d) {

                    diseaseByCountryName[d.CountryCode] = +d[disease];
                    populationByCountryName[d.CountryCode] = +d.Population;
                    gdpByCountryName[d.CountryCode] = + d.GDP;

                });

                //Json world countries parsing
                data.features.forEach(function (d) {

                    d.disease = diseaseByCountryName[d.id];
                    d.GDP = gdpByCountryName[d.id];
                    d.population = populationByCountryName[d.id];
                });

                svg.append("g")
                    .attr("class", "countries")
                    .selectAll("path")
                    .data(data.features)
                    .enter().append("path")
                    .attr("d", path)
                    .style("fill", function (d) {
                        // console.log(populationByCountryName[d.id]);
                        // console.log(diseaseByCountryName[d.id]);
                        return color((diseaseByCountryName[d.id] / populationByCountryName[d.id]) * 10000000000);
                    })
                    .style('stroke', 'white')
                    .style('stroke-width', 1.5)
                    .style("opacity", 0.8)
                    // tooltips
                    .style("stroke", "white")
                    .style('stroke-width', 0.3)
                    .on('mouseover', function (d) {
                        tip.show(d);

                        d3.select(this)
                            .style("opacity", 1)
                            .style("stroke", "white")
                            .style("stroke-width", 3);
                    })
                    .on('mouseout', function (d) {
                        tip.hide(d);

                        d3.select(this)
                            .style("opacity", 0.8)
                            .style("stroke", "white")
                            .style("stroke-width", 0.3);
                    });

                svg.append("path")
                    .datum(topojson.mesh(data.features, function (a, b) {
                        return a.id !== b.id;
                    }))
                    // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
                    .attr("class", "names")
                    .attr("d", path);


            });
        }

    }

    updateMap(diseaseName){
        this.drawMap(diseaseName);
    }

}
