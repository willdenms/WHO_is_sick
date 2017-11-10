// This is the script.js file
let graph = new relationshipVisualization();
let globalMap = new GlobalMap();

d3.csv("data/barChart.csv", function(error, statistics){
    let barChart = new BarChart(statistics);
});