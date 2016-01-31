

// ---------------------------------------------------------------------------
//
// ---------------------------------------------------------------------------
function layout()
{
        var margin = 20;
        var diameter = Math.max(
                300,
                Math.min(document.body.clientWidth, document.body.clientHeight));

        var pack = d3.layout.pack()
                .padding(2)
                .size([diameter - margin, diameter - margin])
                .value(function(d) { return d.size; });

        var svg = d3.select("#graph").append("svg")
                .attr("width", diameter)
                .attr("height", diameter)
                .append("g")
                .attr("transform", "translate(" +
                      diameter / 2 + "," + diameter / 2 + ")");

        var root = new VTree().to_d3_hierarchy();

        var nodes = pack.nodes(root);

        var color = d3.scale.linear()
            .domain([-1, 5])
            .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
            .interpolate(d3.interpolateHcl);

        var circle = svg.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
            .style("fill", function(d) { return d.children ? color(d.depth) : null; })
            // .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });
            .on("click",
                function(d) {
                        window.location = "entity.html?id=" + encodeURIComponent(d.entity.get_id())
                        d3.event.stopPropagation();
                });

        var root = {};
        var text = svg.selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("class", "label")
        // .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
        // .style("display", function(d) { return d.parent === root ? null : "none"; })
            .text(function(d) { return d.get_name(); });

        var node = svg.selectAll("circle,text");

        function zoomTo(v) {
                var k = diameter / v[2]; view = v;
                node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
                circle.attr("r", function(d) { return d.r * k; });
        }

        // zoomTo([root.x, root.y, root.r * 2 + margin]);
        zoomTo([diameter / 2, diameter / 2, diameter + margin]);
}
