// This is the script.js file

let globalMap = new GlobalMap();


d3.csv("data/WHO_stats_2015_5.csv", function(error, dataCSV){
        // 0.1 -- 0.1*1000 = 100; 100 people died of the total people died in that country

        let barChart = new BarChart(dataCSV);
        barChart.createTableReal(dataCSV);

        let diseaseData = d3.nest()
            .key(function(d){
                return d["Disease Name"];
            })
            .rollup(function (leaves){
                let codes = Object.keys(leaves[0]);
                let final = [];

                codes.forEach(function (d) {
                    let value = {};
                    value.code = d;
                    value.mortality = leaves[0][d];
                    final.push(value);
                });
                return final;
            })
            .entries(dataCSV);

        d3.csv("data/CountryDataByYear.csv", function (error, countryData) {

            countryData.forEach(function (d) {
                if(d["Series Name"] === "GDP per capita (current US$)"){
                    for(disease of diseaseData){
                        for(country of disease.value){
                            if(country.code === d["Country Code"]){
                                country.GDP = d["2015 [YR2015]"];
                                country.name = d["Country Name"];
                            }
                        }
                    }
                }
            });

        });

        console.log(diseaseData);

        let graph = new relationshipVisualization(barChart);

        d3.csv("data/diesease_tree.csv", function (error, data) {
            if (error) throw error;
            graph.createTree(data);
        });
    });