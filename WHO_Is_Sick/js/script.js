// This is the script.js file

let globalMap = new GlobalMap();

d3.csv("data/barChart.csv", function(error, statistics){
    let barChart = new BarChart(statistics);
    barChart.createTable();


    let graph = new relationshipVisualization(barChart);

    d3.csv("data/diesease_tree.csv", function (error, data) {
        if (error) throw error;

        graph.createTree(data);
    });
});