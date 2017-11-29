class relationshipVisualization {
    constructor() {
        // source: https://bl.ocks.org/mbostock/4063550
        var svg = d3.select("#relationship-visualization").append("svg")
            .attr("width", 1450)
            .attr("height", 1500);

        var width = +svg.attr("width"),
            height = +svg.attr("height"),
            g = svg.append("g").attr("transform", "translate(" + (width / 3) + "," + (height / 2.5) + ")"),
            root;
        //svg.append("g").attr("transform", "translate(" + (width / 2 + 40) + "," + (height / 2 + 90) + ")");

        var stratify = d3.stratify()
            .parentId(function (d) {
                return d.id.substring(0, d.id.lastIndexOf("."));
            });

        var tree = d3.tree()
            .size([2 * Math.PI, 500])
            .separation(function (a, b) {
                return (a.parent == b.parent ? 1 : 2) / a.depth;
            });

        d3.csv("data/diesease_tree.csv", function (error, data) {
            if (error) throw error;

            console.log(data);
            root = tree(stratify(data));

            // function collapse(d) {
            //     if (d.children) {
            //         d._children = d.children;
            //         d._children.forEach(collapse);
            //         d.children = null;
            //     }
            // }

            //root.children.forEach(collapse); // this line collapses tree to root and its children
            update(root);
        });

        function radialPoint(x, y) {
            return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
        }

        function update(source){
            // All commented out code is for collapsing the tree which is not fully implemented yet
            // var treeData = tree(root);


            // let nodes = treeData.descendants(),
            //     links = treeData.descendants().slice(1);

            var node = g.selectAll(".node")
                .data(source.descendants())
                .enter().append("g")
                .attr("class", function(d) { console.log("enter");return "node" + (d.children ? " node--internal" : " node--leaf"); })
                .attr("transform", function(d) { return "translate(" + radialPoint(d.x, d.y) + ")"; });
                //.on("click", click);

            node.append("circle")
                .attr("r", 5.5);

            node.append("text")
                .attr("dy", "0.31em")
                .attr("x", function(d) { return d.x < Math.PI === !d.children ? 6 : -6; })
                .attr("text-anchor", function(d) { return d.x < Math.PI === !d.children ? "start" : "end"; })
                .attr("transform", function(d) { return "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; })
                .text(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1); });

            // var nodeUpdate = nodeEnter.merge(node);
            //
            // nodeUpdate
            //     .transition()
            //     .duration(750)
            //     .attr("transform", function(d) { return "translate(" + radialPoint(d.x, d.y) + ")"; });
            //
            // nodeUpdate.select("circle.node")
            //     .attr("r", 5.5)
            //     .attr("class", function(d) { console.log("update");return "node" + (d.children ? " node--internal" : " node--leaf"); });
            //
            // var nodeExit = node.exit().transition()
            //     .duration(750)
            //     .attr("transform", function(d) { console.log("remove"); return "translate(" + radialPoint(d.x, d.y) + ")"; })
            //     .remove();
            //
            // nodeExit.select('circle')
            //     .attr('r', 1e-6);
            //
            // nodeExit.select('text')
            //     .style('fill-opacity', 1e-6);



            var link = g.selectAll(".link")
                .data(source.links())
                .enter().append("path")
                .attr("class", "link")
                .attr("d", d3.linkRadial()
                    .angle(function(d) { return d.x; })
                    .radius(function(d) { return d.y; }));

            // var linkUpdate = linkEnter.merge(link);
            //
            // linkUpdate.transition()
            //     .duration(750)
            //     .attr("d", d3.linkRadial()
            //         .angle(function(d) { return d.x; })
            //         .radius(function(d) { return d.y; }));
            //
            // var linkExit = link.exit().transition()
            //     .duration(750)
            //     .attr("d", d3.linkRadial()
            //         .angle(function(d) { return d.x; })
            //         .radius(function(d) { return d.y; }))
            //     .remove();
            //
            // function click(d) {
            //     if (d.children) {
            //         d._children = d.children;
            //         d.children = null;
            //     } else {
            //         d.children = d._children;
            //         d._children = null;
            //     }
            //     update(d);
            // }


        }
    }

    createTree() {

    }

    updateTree() {

    }
}