class BarChart{

    constructor(statistics)
    {
        this.statistics = statistics
        console.log(this.statistics);

        this.cell = {
            "width": 80,
            "height": 20,
            "buffer": 15
        };

        // Maximum mortality rate
        // This is going to change in the future depending upon the disease selected.
        let max_mortality = d3.max(this.statistics, function(d){
            return d['MortalityRate']
        });

        console.log("This is the maximum");
        console.log(max_mortality);

        // bar width scale
        this.mortalityWidthScale = d3.scaleLinear()
                                    .domain([0, max_mortality])
                                    .range([0, this.cell.width - this.cell.buffer]);

        // color scale for the bars
        this.mortalityColorScale = d3.scaleLinear()
                                    .domain([0, max_mortality])
                                    .range(['#cb181d','#034e7b']);
    }

    createTable()
    {
        console.log("Hello World!");
        console.log(this.statistics);

        let tr = d3.select('tbody').selectAll('tr')
            .data(this.statistics);

        tr = tr
            .enter()
            .append('tr');


        let td = tr.selectAll('td')
                .data(function(d){
                    return [
                        {'vis':'text', 'value':d['Country']},
                        {'vis': 'bar', 'value':d['MortalityRate']}
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
        });

        let td_bar = td.filter(function(d){
            return d.vis == 'bar';
        });

        td_bar = td_bar.append('svg')
                    .attr('width', this.cell.width)
                    .attr('height', this.cell.height);

        td_bar.append('rect')
            .attr('width', (d)=>{
                console.log(this.mortalityWidthScale);
                console.log(d.value);
                console.log(this.mortalityWidthScale(d.value));
                return this.mortalityWidthScale(d.value);
            })
            .attr('height', this.cell.height - 5)
            .style('fill', (d)=>{
                return this.mortalityColorScale(d.value);
            })
    }

    update()
    {

    }
}