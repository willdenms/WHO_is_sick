var global_data = "";
var global_country_codes = "";
var global_world = "";
var global_world_map_self = "";

var global_country_data = "";
var _colorScale;
var global_selected = [];
var global_rotation = [];
var rotation_play = false;

var rotate = [10, -10],
    velocity = [.01, 0],
    time = Date.now();
/**
 * Constructor for the WorldChart
 */
function WorldChart(){

    var self = this;
    global_world_map_self = this;
    self.init();
}



/**
 * Initializes the svg elements required to lay the globe
 * and to populate the legend.
 */
WorldChart.prototype.init = function(){
    var self = this;

    //Gets access to the div element created for this chart and legend element from HTML
    var divWorldChart = d3.select("#world").classed("content", true);
    var legend = d3.select("#legend").classed("content",true);
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    self.svgWidth = 500;
    self.svgHeight = 500;

    var legendHeight = self.svgHeight;

    //creates svg elements within the div
    self.legendSvg = legend.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",legendHeight)
        .attr("transform", "translate(" + self.margin.left + ",0)");

    self.svg = divWorldChart.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
        .attr("transform", "translate(" + self.margin.left + ",0)")
        .style("bgcolor","green")
        .style("cursor", "all-scroll")

};

/**
 * Reads in the required data to draw the globe and then calls the function to draw it.
 *
 * @param country_data country data for pollution
 */
WorldChart.prototype.update = function(country_data){
    var self = this;

    // Change method to setup!!!
    global_country_data = country_data;

    queue()
        .defer(d3.json, "data/newWorldCoords.json")
        .defer(d3.tsv, "data/newWorldCountryNames.tsv")
        .await(self.drawMap);
};

/**
 * Creates the year array
 */
function YearArray(Years,start_year,end_year){
    var yearArr = [];

    if(Array.isArray(Years))
        return Years;

    //Put years object into an array
    for(var i = 0; i< years.length; i++){

        //Only grab years within our bounds
        if(years[i] >= start_year && end_year >=years[i])
            yearArr[i] = Years[years[i]];
    }

    yearArr = yearArr.filter(function(dd){
        return dd !== "" && dd!= ".."; });

    return yearArr;
}

/**
 * Figures out the max option available
 */
function OptionMax(option){
    option = YearArray(option, selectedyear1, selectedyear2);
    var max = d3.max(option,function(d) {
        return parseFloat(d);
    });
    return max;
}

/**
 * Figures out the min option available
 */
function OptionMin(option){
    option = YearArray(option, selectedyear1, selectedyear2);
    var min = d3.min(option,function(d) {
        return parseFloat(d);
    });
    return min;
}

/**
 * Creates the ability to filter the options
 */
function filterOptions(_option,_options){
    _options = YearArray(_options,selectedyear1,selectedyear2);
    return _options.filter(function(d){
        var r = d.Name === _option;
        return r;
    })
}

/**
 * Updates map visualization when a user interacts with it
 */
function updateMap (option) {

    var self = global_world_map_self;
    var world = global_world;
    var countryCodes = global_country_codes;
    var country_data = global_data;

    var min = 100000000;

    var max = 0;

    country_data.forEach(function(d){
        var _option = d.Options.filter(function(dd){
            return dd.Name == option;
        });

        var minTemp = OptionMin(_option[0].Years);
        var maxTemp = OptionMax(_option[0].Years);

        if(minTemp < min)
            min = minTemp;

        if(maxTemp > max)
            max = maxTemp;

    });


    colors = ["#ffe6e6", "#ffcccc","#ffb3b3","#ff8080", "#ff4d4d","#ff1a1a","#e60000","#b30000","#800000"];

    var buckets = 100000;

    var colorScale = d3.scaleQuantile()
        .domain([min, buckets - 1, max])
        .range(colors);

    self.svg.select("#title").text(function(){
        if(selectedyear1 == selectedyear2)
            return selectedyear1;
        return selectedyear1 + " - " + selectedyear2;
    });

    var legendLinear = d3.legendColor()
        .shapeWidth(20)
        .cells(9)
        .labelFormat(d3.format(".0s"))
        .orient('vertical')
        .scale(colorScale);

    self.legendSvg.select(".legendLinear")
        .call(legendLinear);

    self.svg.selectAll("path")
        .data(topojson.feature(world, world.objects.countries).features)
        .attr("fill", function (d) {
            var data = findData(d, countryCodes, country_data);

            if (data === undefined || data === null || data.Options.length == 0) {
                return "#d9d9d9";
            }
            else
            {
                if (data.Options.length > 0)
                {
                    var _option = filterOptions(option,data.Options);
                    var yearArr = YearArray(_option[0].Years, selectedyear1, selectedyear2);

                    if (yearArr < 1)
                        return "#d9d9d9";
                    else {
                        for(var i = 0; i<yearArr.length;i++){
                            yearArr[i] = parseFloat(yearArr[i]);
                        }

                        return colorScale(d3.sum(yearArr) / yearArr.length);
                    }
                }
            }
        });
}

/**
 * Draws the map visualization for the first time on page load
 */
WorldChart.prototype.drawMap = function(error, world, countryCodes) {
    global_data = global_country_data;
    global_country_codes = countryCodes;
    global_world = world;
    var self = global_world_map_self;

    self.svg.append("text")
        .text(function(){
            if(selectedyear1 == selectedyear2)
                return selectedyear1;

            return selectedyear1 + " - " + selectedyear2;
        })
        .attr("x", self.svgWidth - 90)
        .attr("y", 50)
        .attr("id","title")
        .style("font-size","14px")
        .style("font-weight","600")
        .attr("z-index", 1000);


    var countries = topojson.feature(world, world.objects.countries).features;

    var min = 100000000;

    var max = 0;
    var option = $("#controls > div > button > span.filter-option.pull-left").text();
    country_data.forEach(function(d){
        var _option = d.Options.filter(function(dd){
            return dd.Name == option;
        });

        var minTemp = OptionMin(_option[0].Years);
        var maxTemp = OptionMax(_option[0].Years);

        if(minTemp < min)
            min = minTemp;

        if(maxTemp > max)
            max = maxTemp;

    });

    projection = d3.geoOrthographic()
        .scale(245)
        .rotate([0, 0])
        .translate([self.svgWidth / 2, self.svgHeight / 2])
        .clipAngle(90);

    var path = d3.geoPath()
        .projection(projection);

    colors = ["#ffe6e6", "#ffcccc","#ffb3b3","#ff8080", "#ff4d4d","#ff1a1a","#e60000","#b30000","#800000"];

    var buckets = 100000;

    var colorScale = d3.scaleQuantile()
        .domain([min, buckets - 1, max])
        .range(colors);

    _colorScale = colorScale;

    // Setup Legend
    self.legendSvg.append("g")
        .attr("class", "legendLinear")
        .attr("transform", "translate(0, 350)");

    var legendLinear = d3.legendColor()
        .shapeWidth(20)
        .cells(9)
        .labelFormat(d3.format(".0s"))
        .orient('vertical')
        .scale(colorScale);

    self.legendSvg.select(".legendLinear")
        .call(legendLinear);

    var graticule = d3.geoGraticule();

    var drag = d3.drag()
        .subject(function() { var r = projection.rotate(); return {x: r[0] / .25, y: -r[1] / .25}; })
        .on("drag", function() {
            clearIntervals();

            $(this).css( 'cursor', 'all-scroll' );

            var rotate = projection.rotate();
            projection.rotate([d3.event.x * .25, -d3.event.y * .25, rotate[2]]);
            svg.selectAll(".graticule").attr("d", path);
            svg.selectAll(".country").attr("d", path);
        })
        .on("end", function(){
            if(!rotation_play)
                return;
            time = Date.now();
            rotate = projection.rotate();
            clearIntervals();
            global_rotation.push(setInterval(function(){
                var dt = Date.now() - time;
                projection.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1] * dt]);
                svg.selectAll(".graticule").attr("d", path);
                svg.selectAll(".country").attr("d", path);
            }, 10));
        });


    //Tooltip Div
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("border-style","solid")
        .style("border-width",".01em")
        .style("padding","5px");

    var svg = self.svg;

    svg.selectAll("path")
        .data(countries)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("id", function (d) {
            return (d.id);
        })
        .attr("stroke", "#f7f7f7")
        .attr("fill", function (d) {
            var data = findData(d, countryCodes, global_data);

            if (data === undefined || data === null || data.Options.length == 0) {
                return "#d9d9d9";
            }
            else
            {
                if (data.Options.length > 0)
                {
                    var _option = filterOptions(option,data.Options);
                    var yearArr = YearArray(_option[0].Years, selectedyear1, selectedyear2);

                    if (yearArr < 1)
                        return "#d9d9d9";
                    else {
                        for(var i = 0; i<yearArr.length;i++){
                            yearArr[i] = parseFloat(yearArr[i]);
                        }

                        return colorScale(d3.sum(yearArr) / yearArr.length);
                    }
                }
            }
        })
        .on("click", function (d) {
            var country_name = findData(d, countryCodes, global_data);

            var Exists = false;
            global_selected.forEach(function(d){
                if(d.Name === country_name.Name) {
                    Exists = true;
                    return;
                }
            });

            if(Exists)
                return;

            var cc = country_name.Info["Country code"].toLowerCase();

            var html = "<li class='list-group-item'>" +country_name.Name;
            html +="<div class='flag-icon flag-icon-"+ cc +" flag-icon-squared' style='margin-left: 10px'></div>";
            html +="<span class='label label-danger pull-right' style='cursor: pointer' onclick='remove(this)'>x</span></li>";

            $('#selected_countries').append(html);

            var CountryPack = {};
            CountryPack.Name = country_name.Name;
            CountryPack.Data = country_name;
            global_selected.push(CountryPack);

            if(global_selected.length > 1) {
                createComparison();
                $("#c_select").selectpicker('show')
            }

        })
        .on("mouseover", function(d) {
            var country_name = findData(d, countryCodes, global_data);

            if(country_name == undefined)
                return;

            div.transition()
                .duration(200)
                .style("opacity", .9);
            div	.html("<center><h3>"+country_name.Name+"</h3></center>" +
                "<div id='FuelTypes'></div>"+
                "<div id='CombustionFactors'></div>")
                .style("left",  self.svgWidth + 150 + "px")
                .style("top", self.svgHeight - 300 + "px");

            map_tooltip(country_name.Code, selectedyear1, selectedyear2)
        })
        .on("mouseout", function() {
            div.transition()
                .duration(500)
                .style("opacity", 0);
            div.html("");
        })
        .attr("style","cursor: pointer");

    svg.insert("path", "path.countries")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    svg.call(drag);


    var zoom = d3.zoom()
        .scaleExtent([1, 10])
        .on("zoom", function(){
            clearIntervals();
            svg.selectAll(".graticule").attr("transform", d3.event.transform);
            svg.selectAll(".country").attr("transform", d3.event.transform);

            if(!rotation_play)
                return;
            global_rotation.push(setInterval(function(){
                var dt = Date.now() - time;
                projection.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1] * dt]);
                svg.selectAll(".graticule").attr("d", path);
                svg.selectAll(".country").attr("d", path);
            }, 10));
        });

    svg.call(zoom);

    $("#play").on("click",function(d){
        time = Date.now();
        rotate = projection.rotate();
        clearIntervals();
        global_rotation.push(setInterval(function(){
            var dt = Date.now() - time;
            projection.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1] * dt]);
            svg.selectAll(".graticule").attr("d", path);
            svg.selectAll(".country").attr("d", path);
        }, 10));

        rotation_play = true;
    });
    $("#pause").on("click",function(d){
        clearIntervals();
        rotation_play = false;
    })

};

function clearIntervals(){
    for(var i = 0; i< global_rotation.length; i++){
        clearInterval(global_rotation[i]);
    }
}

/**
 * Helper method for pairing country json id's to country names
 */
function findData (d, countryCodes, country_data) {
    var country_name = "";
    for (var j = 0; j < countryCodes.length; j++)
    {
        if (countryCodes[j].id == d.id)
        {
            country_name = countryCodes[j].name;
            break;
        }
    }

    for (j = 0; j < country_data.length; j++)
    {
        if (country_data[j].Name == country_name)
        {
            return (country_data[j]);
        }
    }
}

/**
 * Calls the updateMap function based on the user selections
 */
function chooseData() {

    //Changed the selected data when a user selects a different
    // menu item from the drop down.

    var data = $("#controls > div > button > span.filter-option.pull-left").text();
    updateMap(data);
}
function refreshData(){
    _WordCloud.setGlobal(false);
    //Wait for the data to reload
    setTimeout(function(){
        chooseData();
    }, 100);
}
function remove(elem){
    var Country = $(elem).parent().text();
    var element = $(elem).parent().remove();

    Country = Country.substring(0,Country.length-1);

    global_selected = global_selected.filter(function(d){
        return d.Name !== Country;
    });


    $("#comparison").html("");
    if(global_selected.length >1)
        createComparison();
    else
        $(".#c_select").selectpicker('hide');
}

