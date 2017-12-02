// This is the script.js file

let globalMap = new GlobalMap();

d3.json("data/dummyDataStructureProper.json", function(error, jsonFile){
    // 0.1 -- 0.1*1000 = 100; 100 people died of the total people died in that country
    let barChart = new BarChart(jsonFile);
    barChart.createTableReal(jsonFile);

    let graph = new relationshipVisualization(barChart);

    d3.csv("data/diesease_tree.csv", function (error, data) {
        if (error) throw error;
        graph.createTree(data);
    });
});