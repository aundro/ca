
function layout()
{
        var id = window.search_params_get["id"];
        // var all_entities = [get_entity_by_id(id)];

        function sizer()
        {
                return 10;
        }

        var i, n, ent, node;
        var linksets = get_linksets_for_id(id), linkset;
        var d3_nodes = [get_entity_by_id(id).to_d3_node(sizer)];
        var d3_links = [];
        for ( i = 0, n = linksets.length; i < n; ++i )
        {
                linkset = linksets[i];
                ent = get_entity_by_id(
                        linkset.from === id ? linkset.to : linkset.from);
                node = ent.to_d3_node(sizer);
                d3_nodes.push(node);
                d3_links.push({
                        source : d3_nodes[0],
                        target : node
                });
        }
        

        var w = 600,
            h = 600,
            node,
            link,
            root;

        var force = d3.layout.force()
            .on("tick", tick)
            // .charge(function(d) { return d._children ? -d.size / 100 : -30; })
            .charge(function(d) { return -30; })
            // .linkDistance(function(d) { return d.target._children ? 80 : 30; })
            .linkDistance(function(d) { return 30; })
            .size([w, h - 160]);

        var vis = d3.select("#graph").append("svg")
            .attr("width", w)
            .attr("height", h);


        // var raw_nodes = all_entities.map(
        //         function (entity)
        //         {
        //                 function sizer()
        //                 {
        //                         return 100;
        //                 }
        //                 return entity.to_d3_node(sizer);
        //         });
        force.nodes(d3_nodes).links(d3_links).start();

        // Update the links…
        link = vis.selectAll("line.link")
                .data(d3_links, function(d) { return d.target.name; });

        // Enter any new links.
        link.enter().insert("svg:line", ".node")
                .attr("class", "link")
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

        // Exit any old links.
        link.exit().remove();

        // Color leaf nodes orange, and packages white or blue.
        function color(d) {
                return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
        }

        // Update the nodes…
        node = vis.selectAll("circle.node")
                .data(d3_nodes, function(d) { return d.name; })
                .style("fill", color);

        node.transition()
                .attr("r", function(d) { return d.size; });

        // Enter any new nodes.
        node.enter().append("circle")
                .attr("class", "node")
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr("r", function(d) { return d.size; })
                .style("fill", color)
                // .on("click", click)
                .call(force.drag);

        // Exit any old nodes.
        node.exit().remove();

        function tick()
        {
                link.attr("x1", function(d) { return d.source.x; })
                        .attr("y1", function(d) { return d.source.y; })
                        .attr("x2", function(d) { return d.target.x; })
                        .attr("y2", function(d) { return d.target.y; });
                
                node.attr("cx", function(d) { return d.x; })
                        .attr("cy", function(d) { return d.y; });
        }
}
