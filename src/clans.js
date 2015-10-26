
// ---------------------------------------------------------------------------
//
// ---------------------------------------------------------------------------
function VTreeNode(entity)
{
        this.entity = entity;
        this.children = [];
}

// ---------------------------------------------------------------------------
//
// ---------------------------------------------------------------------------
function VTree()
{
        // highest sum of influences within a clan. We maintain this value
        // because we want the clans to all appear with the same size, even
        // though they have in fact different influences (depending on their
        // geographical location, etc...)
        this.max_clan_influence = 0;

        this.toplevels = [];
        var i, n, cur;
        for ( i = 0, n = window.entities.length; i < n; ++i )
                this.find_or_create_node(window.entities[i]);

        // compute max clan influence
        for ( i = 0, n = window.entities.length; i < n; ++i )
        {
                cur = window.entities[i];
                if ( cur.is_clan() )
                        this.max_clan_influence = Math.max(
                                this.max_clan_influence,
                                this.compute_clan_influence_sum(
                                        this.find_node(cur.id)));
        }
}

// ---------------------------------------------------------------------------
VTree.prototype.compute_clan_influence_sum = function(node)
{
        var i, n, total = 0;
        for ( i = 0, n = node.children.length; i < n; ++i )
                total += node.children[i].entity.influence;
        return total;
};

// ---------------------------------------------------------------------------
VTree.prototype.find_or_create_node = function(entity)
{
        var node = this.find_node(entity.id), parent;
        if ( !node )
        {
                node = new VTreeNode(entity);
                if ( !entity.group )
                {
                        // if toplevel, push it in tree right away
                        this.toplevels.push(node);
                }
                else
                {
                        parent = this.find_or_create_node(
                                this.get_entity_for_id(entity.group));
                        parent.children.push(node);
                }
        }
        return node;
};

// ---------------------------------------------------------------------------
VTree.prototype.get_entity_for_id = function(id)
{
        var i, n;
        for ( i = 0, n = window.entities.length; i < n; ++i )
                if ( window.entities[i].id === id )
                        return window.entities[i];
        throw "No entity with ID: \"" + id + "\"";
};

// ---------------------------------------------------------------------------
VTree.prototype.find_node = function(id)
{
        return this.find_node1(this.toplevels, id);
};

// ---------------------------------------------------------------------------
VTree.prototype.find_node1 = function(nodes, id)
{
        var i, n, fnd, node;
        for ( i = 0, n = nodes.length; i < n; ++i )
        {
                node = nodes[i];
                if ( node.entity.id === id )
                        return node;

                fnd = this.find_node1(node.children, id);
                if ( fnd )
                        return fnd;
        }
};

// ---------------------------------------------------------------------------
VTree.prototype.to_d3_node = function(node)
{
        var self = this;
        function sizer(e)
        {
                return self.to_d3_node_sizer(e);
        }
        var d3n = node.entity.to_d3_node(sizer);
        d3n.children = node.children.map(this.to_d3_node, this);
        return d3n;
};

// ---------------------------------------------------------------------------
VTree.prototype.to_d3_hierarchy = function()
{
        return {
                // name : "badasses",
                children : this.toplevels.map(this.to_d3_node, this)
        };
};

// ---------------------------------------------------------------------------
VTree.prototype.to_d3_node_sizer = function (entity)
{
        if ( entity.is_clan() )
        {
                return this.max_clan_influence;
        }
        else if ( entity.is_actor() )
        {
                // // normalized influence
                // var group_sum = this.compute_clan_influence_sum(
                //         this.find_node(entity.group));
                // return n.entity.influence * (
                //         this.max_clan_influence / (group_sum * 1.0));
                return entity.influence;
        }
};

// ---------------------------------------------------------------------------
//
// ---------------------------------------------------------------------------
function layout()
{
        var margin = 20;
        var diameter = 960;

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

        // var SOME_OBJ = "THIS IS AN OBJ";
        // var test_nodes =
        // {
        //  "name": "flare",
        //  "children": [
        //   {
        //    "name": "analytics",
        //    "children": [
        //     {
        //      "name": "cluster",
        //      "children": [
        //       {"name": "AgglomerativeCluster", "size": 3938},
        //       {"name": "CommunityStructure", "size": 3812},
        //       {"name": "HierarchicalCluster", "size": 6714},
        //       {"name": "MergeEdge", "size": 743}
        //      ]
        //     },
        //     {
        //      "name": "graph",
        //      "children": [
        //       {"name": "BetweennessCentrality", "size": 3534, "someobj" : SOME_OBJ},
        //       {"name": "LinkDistance", "size": 5731},
        //       {"name": "MaxFlowMinCut", "size": 7840},
        //       {"name": "ShortestPaths", "size": 5914},
        //       {"name": "SpanningTree", "size": 3416}
        //      ]
        //     },
        //     {
        //      "name": "optimization",
        //      "children": [
        //       {"name": "AspectRatioBanker", "size": 7074}
        //      ]
        //     }
        //    ]
        //   }
        //  ]
        // };

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
               alert(d.someobj);
               d3.event.stopPropagation();
               // alert(d.someobj);
               // var k = 10;
       });

        var root = {};
  var text = svg.selectAll("text")
      .data(nodes)
    .enter().append("text")
      .attr("class", "label")
      // .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      // .style("display", function(d) { return d.parent === root ? null : "none"; })
      .text(function(d) { return d.name; });

  var node = svg.selectAll("circle,text");

  function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
  }

  // zoomTo([root.x, root.y, root.r * 2 + margin]);
  zoomTo([500, 500, 480 * 2 + margin]);


}
