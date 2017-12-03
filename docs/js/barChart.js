class BarChart{

    constructor(allData)
    {
        this.allData = allData;

        this.cell = {
            "width": 145,
            "height": 30,
            "buffer": 60
        };

        let max_gdb = d3.max(allData[0].value, function(d){
            return parseFloat(d['GDP']);
        });

        this.gdbWidthScale = d3.scaleLinear()
            .domain([0, max_gdb])
            .range([0, this.cell.width - this.cell.buffer]);

        // color scale for the bars
        this.gdbColorScale = d3.scaleLinear()
            .domain([0, max_gdb])
            .range(['#cb181d','#034e7b']);

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

        this.diseaseMortality = rowFilter[0].value;

        this.diseaseMortality = this.diseaseMortality.filter(function(record){
            if(record.mortality != '.')
                return record;
        });

        this.diseaseMortality.sort(function(a, b){
            if(parseFloat(a.mortality) > parseFloat(b.mortality))
                return -1;
            else if(parseFloat(a.mortality) < parseFloat(b.mortality))
                return 1;
            return 0;
        });

        let headings = d3
            .select('thead')
            .selectAll('th')
            .on('click', (d, i) =>{

                if(i == 2)
                {
                    // 0 jumbled; 1 descending; 2 ascending
                    let sort = 0;

                    for(let i = 0; i < this.diseaseMortality.length - 1; i++)
                    {
                        if(parseFloat(this.diseaseMortality[i]['GDP']) >= parseFloat(this.diseaseMortality[i + 1]['GDP'])) {
                            sort = 1;
                        }
                        else {
                            sort = 0;
                            break;
                        }
                    }

                    if(sort == 0)
                    {
                        for(let i = 0; i < this.diseaseMortality.length - 1; i++)
                        {
                            if(parseFloat(this.diseaseMortality[i]['GDP']) <= parseFloat(this.diseaseMortality[i + 1]['GDP']))
                                sort = 2;
                            else {
                                sort = 0;
                                break;
                            }
                        }
                    }

                    if(sort == 0 || sort == 2) {
                        this.diseaseMortality.sort(function (a, b) {
                            if (parseFloat(a['GDP']) > parseFloat(b['GDP']))
                                return -1;
                            else if (parseFloat(a['GDP']) < parseFloat(b['GDP']))
                                return 1;
                            else
                                return 0;
                        });
                    }
                    else {
                        this.diseaseMortality.sort(function (a, b) {
                            if (parseFloat(a['GDP']) > parseFloat(b['GDP']))
                                return 1;
                            else if (parseFloat(a['GDP']) < parseFloat(b['GDP']))
                                return -1;
                            else
                                return 0;
                        });
                    }
                }



                d3.select('tbody').selectAll('tr').remove();
                this.updateTable();
            });


        let max_mortality = d3.max(this.diseaseMortality, function(d){
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

    }

    updateTable()
    {
        let tr = d3.select('tbody').selectAll('tr')
            .data(this.diseaseMortality);

        tr = tr
            .enter()
            .append('tr');

        let td = tr.selectAll('td')
            .data(function(d){
                return [
                    {'vis':'text', 'value':d['name']},
                    {'vis': 'bar', 'value':d['mortality']},
                    {'vis': 'bar', 'value':d['GDP']}
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

        let td_bar = td.filter(function(d, i){
            return d.vis == 'bar';
        });

        td_bar = td_bar.append('svg')
            .attr('width', this.cell.width)
            .attr('height', this.cell.height);

        td_bar.append('rect')
            .attr('width', (d, i)=>{
                if(i == 0)
                    return this.mortalityWidthScale(parseFloat(d.value));
                else if(i == 1){
                    if(d.value!=="-1")
                        return this.gdbWidthScale(parseFloat(d.value));
                }
            })
            .attr('height', this.cell.height - 5)
            .style('fill', (d, i)=>{
                if(i == 0)
                    return this.mortalityColorScale(parseFloat(d.value));
                else if(i == 1)
                    return this.gdbColorScale(parseFloat(d.value));
            });

        // Below translation verify and color filling also verify.
        td_bar.append('text')
            .attr('transform', (d, i)=>{
                if(i == 0)
                    return 'translate('+ (this.mortalityWidthScale(parseFloat(d.value)) + 10 )+',20)';
                else {
                    if(d.value != "-1")
                        return 'translate(' + (this.gdbWidthScale(parseFloat(d.value)) + 10 ) + ',20)';
                    else
                        return 'translate(0,20)';
                }
            })
            .text(function(d, i){
                if(i == 1 && d.value === "-1") {
                    return "Not available";
                }
                return d.value;
            })
            .style('fill', 'black');
    }

    update(disease)
    {
        d3.select('tbody').selectAll('tr').remove();
        this.createTableReal(disease);
        this.updateTable();
    }
}