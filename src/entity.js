
function layout()
{
    // var focused_id = window.anchor_params["id"];
    var focused_id = window.search_params_get["id"];
    var levels = parseInt(window.search_params_get["levels"]);
    if ( isNaN(levels) )
	levels = 1;

    function sizer() { return 10; }

    var d3_nodes = [];
    var d3_links = [];
    var entity = get_entity_by_id(focused_id);

    function d3_node_exists(entity)
    {
	var i, n;
	for ( i = 0, n = d3_nodes.length; i < n; ++i )
	    if ( d3_nodes[i].entity === entity )
		return d3_nodes[i];
    }

    function d3_link_exists(entity0, entity1, link)
    {
	var i, n, cur;
	for ( i = 0, n = d3_links.length; i < n; ++i )
	{
	    cur = d3_links[i];
	    if ( cur.link.kind === link.kind
              && (cur.source.entity === entity0 && cur.target.entity === entity1)
               || (cur.source.entity === entity1 && cur.target.entity === entity0) )
	    {
		return true;
	    }
	}
	return false;
    }

    function import_neighbors(entity, levels)
    {
	if ( levels < 0 )
	    return;
	var found_node = d3_node_exists(entity);
	if ( found_node )
	    return found_node;

	// add entity
	var entity_node = entity.to_d3_node(sizer);
	d3_nodes.push(entity_node);

	// add links, and neighbors
	var linksets = get_linksets_for_id(entity.id);
	var linkset, other, j, k, link, other_node, i, n;
	for ( i = 0, n = linksets.length; i < n; ++i )
	{
	    linkset = linksets[i];
	    other = get_entity_by_id(linkset.from === entity.id ? linkset.to : linkset.from);

	    // recurse add new neighbors
	    other_node = import_neighbors(other, levels - 1);

	    //
	    if ( other_node )
	    {
		for ( j = 0, k = linkset.links.length; j < k; ++j )
		{
		    link = linkset.links[j];
		    if ( ! d3_link_exists(entity, other, link) )
		    {
			d3_links.push({
			    source : entity_node,
			    target : other_node,
			    link : link,
			    link_num : j + 1
			});
		    }
		}
	    }
	}
	return entity_node;
    }
    import_neighbors(entity, levels);

/*
    for ( i = 0, n = linksets.length; i < n; ++i )
    {
        linkset = linksets[i];
        ent = get_entity_by_id(
            linkset.from === focused_id ? linkset.to : linkset.from);
        node = ent.to_d3_node(sizer);
        d3_nodes.push(node);
	for ( j = 0, k = linkset.links.length; j < k; ++j )
	{
            d3_links.push({
		source : d3_nodes[0],
		target : node,
		link : linkset.links[j],
		link_num : j + 1
            });
	}
    }
*/    

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
        .linkDistance(function(d) { return 100; })
        .size([w, h - 160]);

    var svg = d3.select("#graph").append("svg");
    svg.attr("width", w).attr("height", h);

    force.nodes(d3_nodes).links(d3_links).start();

    var link_sel = svg.append("svg:g").selectAll("path").data(force.links());

    // links management
    link_sel.enter().append("svg:path")
	.attr("class",
	      function(d)
	      {
		  return "link link_" + d.link.kind;
	      })
	.on("mouseover", function(d) { ; });
    link_sel.exit().remove()


    // vertices management
    function vertex_data_is_focused_id(d) { return d.entity.id === focused_id; }
    var node_sel = svg.selectAll("circle")
        .data(d3_nodes, function(d) { return d.name; });

    node_sel.transition()
        .attr("r", function(d) { return d.size; });

    node_sel.enter().append("circle")
        .attr("class", function(d) 
	      {
		  var parts = ["entity"];
		  if ( vertex_data_is_focused_id(d) )
		      parts.push("focused_entity");
		  return parts.join(" ");
	      })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return d.size * (vertex_data_is_focused_id(d) ? 2 : 1); })
    // .on("click", click)
        .call(force.drag);
    node_sel.exit().remove();

    // vertices labels
    var text_sel = svg.selectAll("text")
	.data(d3_nodes, function(d) { return d.name; });
    text_sel.enter().append("text").text(function(d) { return d.name; });
    text_sel.exit().remove();

/*
    setTimeout(
	function()
	{
	    var more_nodes = [], i;
	    for ( j = 0; j < d3_nodes.length; ++j )
		more_nodes.push(d3_nodes[j]);
	    more_nodes.push({
		source : null,
		target : null,
		link : null,
		link_num : 100
            });
	    node_sel.data(more_nodes).enter().append("circle");
	    console.log("Done!");
	}, 5000);
*/

    function tick()
    {
	link_sel
	    .attr("d",
		  function(d)
		  {
		      var dx = d.target.x - d.source.x,
			  dy = d.target.y - d.source.y,
			  dr = 75 / d.link_num; 
		      return "M" + d.source.x + "," + d.source.y + 
			  "A" + dr + "," + dr + " 0 0,1 " + 
			  d.target.x + "," + d.target.y;
		  });

        node_sel
	    .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

	text_sel
            .attr("transform", function(d) { return "translate(" + (d.x) + "," + (d.y) + ")"; });
            // .attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    }
}
