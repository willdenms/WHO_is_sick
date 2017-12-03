class BarChart{

    constructor(allData)
    {
        this.allData = allData;

        this.cell = {
            "width": 145,
            "height": 30,
            "buffer": 60
        };

        // Maximum mortality rate
        // This is going to change in the future depending upon the disease selected.
        /*let max_mortality = d3.max(this.statistics, function(d){
            return d['MortalityRate']
        });

        // bar width scale
        this.mortalityWidthScale = d3.scaleLinear()
                                    .domain([0, max_mortality])
                                    .range([0, this.cell.width - this.cell.buffer]);

        // color scale for the bars
        this.mortalityColorScale = d3.scaleLinear()
                                    .domain([0, max_mortality])
                                    .range(['#cb181d','#034e7b']);*/
    }

    createTableReal(diseaseName)
    {
        document.getElementById('mortality-title').innerText = 'Mortality Rate due to ' + diseaseName;

        let rowFilter = this.allData.filter(function(row){

            if(row.key == diseaseName)
            {
                return row;
            }
        });

        let diseaseMortality = rowFilter[0].value;

        diseaseMortality = diseaseMortality.filter(function(record){
            if(record.mortality != '.')
                return record;
        });

        console.log(diseaseMortality[0].name);

        diseaseMortality.sort(function(a, b){
            if(parseFloat(a.mortality) > parseFloat(b.mortality))
                return -1;
            else if(parseFloat(a.mortality) < parseFloat(b.mortality))
                return 1;
            return 0;
        });

        let max_mortality = d3.max(diseaseMortality, function(d){
            return parseFloat(d['mortality']);
        });

        // bar width scale
        this.mortalityWidthScale = d3.scaleLinear()
            .domain([0, max_mortality])
            .range([0, this.cell.width - this.cell.buffer]);

        // color scale for the bars
        this.mortalityColorScale = d3.scaleLinear()
            .domain([0, max_mortality])
            .range(['#cb181d','#034e7b']);

        let tr = d3.select('tbody').selectAll('tr')
                            .data(diseaseMortality);

        tr = tr
            .enter()
            .append('tr');

        let td = tr.selectAll('td')
                    .data(function(d){
                        return [
                            {'vis':'text', 'value':d['name']},
                            {'vis': 'bar', 'value':d['mortality']}
                        ];
                    });

        td = td
            .enter()
            .append('td');

        let td_text = td.filter(function(d){
            return d.vis == 'text';
        });

        td_text.text(function(d){
            return d.value;
        }).classed('country-name-style', true);

        let td_bar = td.filter(function(d){
            return d.vis == 'bar';
        });

        td_bar = td_bar.append('svg')
            .attr('width', this.cell.width)
            .attr('height', this.cell.height);

        td_bar.append('rect')
            .attr('width', (d)=>{
                return this.mortalityWidthScale(parseFloat(d.value));
            })
            .attr('height', this.cell.height - 5)
            .style('fill', (d)=>{
                return this.mortalityColorScale(parseFloat(d.value));
            });

        // Below translation verify and color filling also verify.
        td_bar.append('text')
            .attr('transform', (d)=>{
                return 'translate('+ (this.mortalityWidthScale(parseFloat(d.value)) + 10 )+',20)';
            })
            .text(function(d){
                return d.value;
            })
            .style('fill', 'black');

    }

    update(disease)
    {
        d3.select('tbody').selectAll('tr').remove();
        this.createTableReal(disease);
    }
}