class relationshipVisualization {
    constructor(barChart, choropleth) {

        this.barChart = barChart;
        this.choropleth = choropleth;
    }

    createTree(treeData) {

        // source: https://bl.ocks.org/mbostock/4063550
        // http://dataviscourse.net/tutorials/lectures/lecture-d3-layouts
        // https://bl.ocks.org/mbostock/4339083
        // http://bl.ocks.org/ropeladder/83915942ac42f17c087a82001418f2ee
        //svg.append("g").attr("transform", "translate(" + (width / 2 + 40) + "," + (height / 2 + 90) + ")");

        let margin = {top: 20, right: 90, bottom: 30, left: 110};
        let width = 960 - margin.left - margin.right;
        let height = 800 - margin.top - margin.bottom;

        let barChart = this.barChart;
        let choropleth = this.choropleth;

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
        root.clicked = false;
        root.parentClicked = false;

        updateTree(root, barChart, choropleth);

        function collapse(d) {
            if (d.children) {
                d.clicked = false;
                d.parentClicked = false;
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        function falseClick(d) {
            d.clicked = false;
            d.parentClicked = false;
            if (d.children) {
                d.children.forEach(falseClick);
            }
            else if (d._children) {
                d._children.forEach(falseClick);
            }
        }

        function parentClick(d) {
            d.parentClicked = true;
            if(d.parent){
                parentClick(d.parent);
            }
        }

        function updateTree(source, barChart, choropleth) {

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
                });

            // Add Circle for the nodes
            nodeEnter.append('circle')
                .attr('class', 'node')
                .attr('r', function (d) {
                    if (d.clicked) {
                        return 10;
                    }
                    return 6;
                })
                .attr('stroke', function (d) {
                    if (d.clicked) {
                        return "red";
                    }
                    return "steelblue";
                })
                .attr('stroke-width', function (d) {
                    if (d.clicked) {
                        return "4px";
                    }
                    return "1.5px";
                })
                .style("fill", function (d) {
                    if (d.clicked) {
                        return d._children ? "red" : "#fff";
                    }
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

            let cc = clickcancel();

            nodeUpdate.select('circle.node').call(cc);

            cc.on('click', function (d) {
                falseClick(root);
                d.clicked = true;
                parentClick(d);



                let parentLinks = d3.select("#relationship-visualization").selectAll("path")
                    .filter(function (d) {
                        return d.parentClicked;
                    });

                parentLinks

                barChart.update(d.id);
                choropleth.updateMap(d.id);
            });

            cc.on('dblclick', d => click(d, barChart, choropleth));

            // Update the node attributes and style
            nodeUpdate.select('circle.node')
                .style("fill", function (d) {
                    if (d.clicked) {
                        return d._children ? "red" : "#fff";
                    }
                    return d._children ? "lightsteelblue" : "#fff";
                })
                .attr('stroke', function (d) {
                    if (d.clicked) {
                        return "red";
                    }
                    return "steelblue";
                })
                .attr('stroke-width', function (d) {
                    if (d.clicked) {
                        return "4px";
                    }
                    return "1.5px";
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
                .attr("stroke", function (d) {
                    if(d.parentClicked){
                        return "#be2714";
                    }
                    return "#ccc";
                })
                .attr('d', function (d) {
                    let o = {x: source.x0, y: source.y0};
                    return diagonal(o, o)
                });

            // UPDATE
            let linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr('stroke', function (d) {
                    if(d.parentClicked){
                        return "#be2714";
                    }
                    return "#ccc";
                })
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

            function click(d, barChart, choropleth) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                updateTree(d, barChart, choropleth);
            }


            function clickcancel() {
                // we want to a distinguish single/double click
                // details http://bl.ocks.org/couchand/6394506
                var dispatcher = d3.dispatch('click', 'dblclick');

                function cc(selection) {
                    var down, tolerance = 5, last, wait = null, args;

                    // euclidean distance
                    function dist(a, b) {
                        return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2));
                    }

                    selection.on('mousedown', function () {
                        down = d3.mouse(document.body);
                        last = +new Date();
                        args = arguments;
                    });
                    selection.on('mouseup', function () {
                        if (dist(down, d3.mouse(document.body)) > tolerance) {
                            return;
                        } else {
                            if (wait) {
                                window.clearTimeout(wait);
                                wait = null;
                                dispatcher.apply("dblclick", this, args);
                            } else {
                                wait = window.setTimeout((() => {
                                    return () => {

                                        d3.select("#relationship-visualization").selectAll("circle")
                                            .attr('r', 6)
                                            .style('fill', function (d) {
                                                return d._children ? "lightsteelblue" : "#fff";
                                            })
                                            .attr('stroke', 'steelblue')
                                            .attr('stroke-width', '1.5px');


                                        d3.select(this)
                                            .attr('r', 10)
                                            .style('fill', function (d) {
                                                return d._children ? "red" : "#fff";
                                            })
                                            .attr('stroke', "red")
                                            .attr('stroke-width', '4px');

                                        dispatcher.apply("click", this, args);
                                        wait = null;


                                    };
                                })(), 300);
                            }
                        }
                    });
                };
                // Copies a variable number of methods from source to target.
                var d3rebind = function (target, source) {
                    var i = 1, n = arguments.length, method;
                    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
                    return target;
                };

                // Method is assumed to be a standard D3 getter-setter:
                // If passed with no arguments, gets the value.
                // If passed with arguments, sets the value and returns the target.
                function d3_rebind(target, source, method) {
                    return function () {
                        var value = method.apply(source, arguments);
                        return value === source ? target : value;
                    };
                }

                return d3rebind(cc, dispatcher, 'on');
            }
        }
    }
}