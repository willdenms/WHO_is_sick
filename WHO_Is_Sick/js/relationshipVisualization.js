class relationshipVisualization {
    constructor(barChart) {

        this.barChart = barChart;

    }

    createTree(treeData) {

        // source: https://bl.ocks.org/mbostock/4063550
        // http://dataviscourse.net/tutorials/lectures/lecture-d3-layouts
        // https://bl.ocks.org/mbostock/4339083
        //svg.append("g").attr("transform", "translate(" + (width / 2 + 40) + "," + (height / 2 + 90) + ")");

        let margin = {top: 20, right: 90, bottom: 30, left: 90};
        let width = 960 - margin.left - margin.right;
        let height = 800 - margin.top - margin.bottom;

        let barChart = this.barChart;

        let svg = d3.select("#relationship-visualization").append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate("
                + margin.left + "," + margin.top + ")");

        let stratify = d3.stratify()
            .parentId(function (d) {
                return d.id.substring(0, d.id.lastIndexOf("."));
            });

        let i = 0,
        duration = 750,
        root;

        let treemap = d3.tree().size([height, width]);

        root = treemap(stratify(treeData));

        root.x0 = height / 2;
        root.y0 = 0;

        root.children.forEach(collapse);

        //root.children.forEach(collapse); // this line collapses tree to root and its children
        updateTree(root);

        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        function updateTree(source) {
            let treeData = treemap(root);

            // Compute the new tree layout.
            let nodes = treeData.descendants(),
                links = treeData.descendants().slice(1);

            // Normalize for fixed-depth.
            nodes.forEach(function (d) {
                d.y = d.depth * 180
            });

            // ****************** Nodes section ***************************

            // Update the nodes...
            let node = svg.selectAll('g.node')
                .data(nodes, function (d) {
                    return d.id || (d.id = ++i);
                });

            // Enter any new modes at the parent's previous position.
            let nodeEnter = node.enter().append('g')
                .attr('class', 'node')
                .attr("transform", function (d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on('dblclick', click)
                .on('click', d => {
                    d3.select("#relationship-visualization").selectAll("circle")
                        .attr('r', function (d) {
                            console.log("hello1");
                            return 6;
                        });

                    d3.select(this)
                        .attr('r', function (d) {

                            console.log("hello2");
                            return 20;
                        });

                    // console.log(d.id);
                    // barChart.update(d.id);
                });

            // Add Circle for the nodes
            nodeEnter.append('circle')
                .attr('class', 'node')
                .attr('r', 1e-6)
                .style("fill", function (d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

            // Add labels for the nodes
            nodeEnter.append('text')
                .attr("dy", ".35em")
                .attr("x", function (d) {
                    return d.children || d._children ? -13 : 13;
                })
                .attr("text-anchor", function (d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function (d) {
                    return d.id.substring(d.id.lastIndexOf(".") + 1, d.id.length);
                });

            // UPDATE
            let nodeUpdate = nodeEnter.merge(node);

            // Transition to the proper position for the node
            nodeUpdate.transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            // Update the node attributes and style
            nodeUpdate.select('circle.node')
                .attr('r', 6)
                .style("fill", function (d) {
                    return d._children ? "lightsteelblue" : "#fff";
                })
                .attr('cursor', 'pointer');


            // Remove any exiting nodes
            let nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            // On exit reduce the node circles size to 0
            nodeExit.select('circle')
                .attr('r', 1e-6);

            // On exit reduce the opacity of text labels
            nodeExit.select('text')
                .style('fill-opacity', 1e-6);

            // ****************** links section ***************************

            // Update the links...
            let link = svg.selectAll('path.link')
                .data(links, function (d) {
                    return d.id;
                });

            // Enter any new links at the parent's previous position.
            let linkEnter = link.enter().insert('path', "g")
                .attr("class", "link")
                .attr('d', function (d) {
                    let o = {x: source.x0, y: source.y0};
                    return diagonal(o, o)
                });

            // UPDATE
            let linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr('d', function (d) {
                    return diagonal(d, d.parent)
                });

            // Remove any exiting links
            let linkExit = link.exit().transition()
                .duration(duration)
                .attr('d', function (d) {
                    let o = {x: source.x, y: source.y};
                    return diagonal(o, o)
                })
                .remove();

            // Store the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

            // Creates a curved (diagonal) path from parent to the child nodes
            function diagonal(s, d) {

                let path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

                return path

            }

            function click(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                updateTree(d);
            }
        }

    }
}