// This is the script.js file

let globalMap = new GlobalMap();

d3.csv("data/WHO_stats_2015_5.csv", function(error, dataCSV){
    // 0.1 -- 0.1*1000 = 100; 100 people died of the total people died in that country
    let barChart;

    d3.csv("data/WHO_stats_2015_5_transpose.csv", function(error, dataCSV_transpose){
        barChart = new BarChart(dataCSV, dataCSV_transpose);
        barChart.createTableReal();
    });

    let graph = new relationshipVisualization(barChart);

    d3.csv("data/diesease_tree.csv", function (error, data) {
        if (error) throw error;

        graph.createTree(data);
    });
});
