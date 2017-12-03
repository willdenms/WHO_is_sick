// This is the script.js file


d3.csv("data/WHO_stats_2015_5.csv", function (error, dataCSV) {
    // 0.1 -- 0.1*1000 = 100; 100 people died of the total people died in that country


    let diseaseData = d3.nest()
        .key(function (d) {
            return d["Disease Name"];
        })
        .rollup(function (leaves) {
            let codes = Object.keys(leaves[0]);
            let final = [];

            codes.forEach(function (d) {

                if (d != 'Disease Name' && d != '') {
                    let value = {};
                    value.code = d;
                    value.mortality = leaves[0][d];
                    value.name = ""; //Changed below
                    value.GDP = 0.0; // Changed below
                    final.push(value);
                }
            });
            return final;
        })
        .entries(dataCSV);

    d3.csv("data/CountryDataByYear.csv", function (error, countryData) {

        countryData.forEach(function (d) {

            if (d["Series Name"] === "GDP per capita (current US$)") {


                    for(var disease of diseaseData){
                        for(var country of disease.value){
                            if(country.code === d["Country Code"]){
                                let new_object = {};

                                if(d["2015 [YR2015]"] === "..") {
                                    country.GDP = "-1";
                                    country.name = d["Country Name"];
                                }
                                else{
                                    country.GDP = d["2015 [YR2015]"];
                                    country.name = d["Country Name"];
                            }
                        }
                    }
                }
            }
            if (d["Series Name"] === "Population, total") {
                for (var disease of diseaseData) {
                    for (var country of disease.value) {
                        if (country.code === d["Country Code"]) {
                            country["Pop"] = d["2015 [YR2015]"];
                        }
                    }
                }
            }
        });


        let choropleth = new Choropleth(diseaseData[0].value);
        choropleth.drawMap("All Causes");

        let barChart = new BarChart(diseaseData);
        barChart.createTableReal("All Causes");
        barChart.updateTable();

        let graph = new relationshipVisualization(barChart, choropleth);

        d3.csv("data/diesease_tree.csv", function (error, data) {
            if (error) throw error;
            graph.createTree(data);
        });

    });

});