// This is the script.js file
let graph = new relationshipVisualization();
let globalMap = new GlobalMap();

d3.csv("data/WHO_stats_2015_5.csv", function(error, dataCSV){
    // 0.1 -- 0.1*1000 = 100; 100 people died of the total people died in that country

    d3.csv("data/WHO_stats_2015_5_transpose.csv", function(error, dataCSV_transpose){
        let barChart = new BarChart(dataCSV, dataCSV_transpose);
        barChart.createTableReal();
    });
});

