
diam_focused = 80
diam_others = 60
links_distances = {
    "blood" : diam_focused * 2,
    undefined : diam_focused * 4
}
MAX_HIGHLIGHT_NEIGHBORS_DEPTH = 1

function layout()
{
    var focused_id = window.search_params_get["id"];
    var levels = parseInt(window.search_params_get["levels"]);
    if ( isNaN(levels) )
	levels = 1;

    function sizer(entity)
    {
	return (entity.id === focused_id ? diam_focused : diam_others) / 2;
    }

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

	// picture available? register pattern
	var pics = entity.pics, pic, pat_id, dim;
	if ( pics )
	{
	    pic = pics.split(",")[0];
	    pat_id = "pattern_" + entity.id;
	    dim = entity.id === focused_id ? diam_focused : diam_others;
	    defs.append("pattern")
		.attr("id", pat_id)
		.attr("width", "1")
		.attr("height", "1")
		.append("image")
		.attr("xlink:href", "Photos/" + pic)
		.attr("preserveAspectRatio", "xMidYMid slice")
		.attr("width", dim)
		.attr("height", dim);
	    entity_node.pattern_id = pat_id;
	}

	d3_nodes.push(entity_node);

	// add links, and neighbors
	var linksets = get_linksets(entity);
	var linkset, other, j, k, link, other_node, i, n;
	for ( i = 0, n = linksets.length; i < n; ++i )
	{
	    linkset = linksets[i];
	    other = linkset.get_other(entity);

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

    var w = window.innerWidth, h = window.innerHeight;
    var svg = d3.select("#graph").append("svg");
    var defs = svg.append("defs");
    var vis = svg
	.append("svg:g")
	.call(d3.behavior.zoom().on("zoom", rescale))
	.append("svg:g");

    // stuff a rectangle in the background, that will grab events if no other element does it
    vis.append('svg:rect', '.event_grabber')
	.attr('width', w)
	.attr('height', h)
	.attr('fill', 'white');

    // some utilities markers
    var is_in, is_focused;
    for ( is_focused = 0; is_focused < 2; ++is_focused)
    {
	for ( is_in = 0; is_in < 2; ++is_in )
	{
	    var arrow_sz = 10;
	    var mw = (is_focused ? diam_focused : diam_others) + arrow_sz;
	    var marker = defs.append("marker")
		.attr("id", "marker_blood_" + (is_in ? "in" : "out") + (is_focused ? "_focused" : ""))
		.attr("markerWidth", mw)
		.attr("markerHeight", mw)
		.attr("refX", mw/2)
		.attr("refY", mw/2)
		.attr("orient", "auto")
		.attr("markerUnits", "userSpaceOnUse");

	    var path = [], mw_on_2 = mw/2, arrow_sz_on_2 = arrow_sz/2;
	    if ( is_in )
	    {
		path.push("M" + mw + "," + String(mw_on_2 - arrow_sz_on_2));
		path.push("L" + (mw - arrow_sz) + "," + mw_on_2);
		path.push("" + mw + "," + (mw_on_2 + arrow_sz_on_2));
	    }
	    else
	    {
		path.push("M0," + String(mw_on_2 - arrow_sz_on_2));
		path.push("L" + arrow_sz + "," + mw_on_2);
		path.push("0," + (mw_on_2 + arrow_sz_on_2));
	    }
	    marker.append("path").attr("d", path.join(" "));
	}
    }

    // some utilities filters
    var i;
    for ( i = 0; i <= MAX_HIGHLIGHT_NEIGHBORS_DEPTH; ++i )
    {
	var filter = defs.append("filter");
	filter.attr("id", "highlit_heighbor_depth_" + i)
	    .attr("x", "-50%")
	    .attr("y", "-50%")
	    .attr("width", "200%")
	    .attr("height", "200%");
	filter.append("feGaussianBlur")
	    .attr("in", "SourceGraphics")
	    .attr("result", "offsetblur")
	    .attr("stdDeviation", "15");
	filter.append("feBlend")
	    .attr("in", "SourceGraphic")
	    .attr("in2", "offsetblur")
	    .attr("mode", "normal");
    }


    import_neighbors(entity, levels);

    var node, link, root, force = d3.layout.force()
        .on("tick", tick)
    // .charge(function(d) { return d._children ? -d.size / 100 : -30; })
        .charge(function(d) { return -5000; })
        .linkDistance(
	    function(link)
	    {
		var lkind = link.link.kind;
		return lkind in links_distances
		    ? links_distances[lkind]
		    : links_distances[undefined];
	    })
        // .linkStrength(
	//     function(link)
	//     {
	// 	return link.link.kind === "blood" ? 1 : 0.1;
	//     })
        .size([w, h - 160]);

    svg.attr("width", w).attr("height", h);

    force.nodes(d3_nodes).links(d3_links).start();

    var link_sel = vis.append("svg:g").selectAll("path").data(force.links());

    function get_marker_for_link(d, is_marker_start)
    {
	var marker = [];
	if ( d.link.kind === "blood" )
	{
	    var sire = d.link.metadata["sire"];
	    if ( is_marker_start && d.target.entity.id === sire
              || !is_marker_start && d.source.entity.id === sire )
	    {
		marker.push("url(#marker_blood_");
		marker.push((is_marker_start && d.target.entity.id === sire) ? "in" : "out");
		if ( is_marker_start && d.source.entity.id === focused_id
                  || !is_marker_start && d.target.entity.id === focused_id )
		{
		    marker.push("_focused");
		}
	    }		    
	}
	return marker.join("");
    }

    // links management
    link_sel.enter()
        .append("svg:path")
    	.attr("class", function(d) { return "link link_" + d.link.kind; })
	.attr("marker-start", function(d) { return get_marker_for_link(d, true); })
	.attr("marker-end", function(d) { return get_marker_for_link(d, false); })
    	.on("mouseover", function(d) { ; });
    link_sel.exit().remove()


    // vertices management
    var node_sel = vis.selectAll("circle.entity")
        .data(d3_nodes, function(d) { return d.name; });

    node_sel.transition()
        .attr("r", function(d) { return d.size; });

    function unclassify_all_entities()
    {
	for ( i = 0; i <= MAX_HIGHLIGHT_NEIGHBORS_DEPTH; ++i )
	    node_sel.attr("filter", "");
    }

    function get_svg_node(entity)
    {
	return node_sel.filter(function (d) { return d.entity === entity; });
    }

    function entity_mouseenter(d)
    {
	unclassify_all_entities();
	var encountered = [];
	function one_level(entity, depth)
	{
	    if ( depth > MAX_HIGHLIGHT_NEIGHBORS_DEPTH )
		return;
	    var neighbors = entity.get_neighbors(entity), i, n, neighbor;
	    for ( i = 0, n = neighbors.length; i < n; ++i )
	    {
		neighbor = neighbors[i];
		if ( encountered.indexOf(neighbor) < 0 )
		{
		    encountered.push(neighbor);
		    get_svg_node(neighbor)
			.attr("filter", "url(#highlit_heighbor_depth_" + depth + ")");
		    one_level(neighbor, depth + 1);
		}
	    }
	}
	get_svg_node(d.entity).attr("filter", "url(#highlit_heighbor_depth_0)");
	one_level(d.entity, 1);
    }

    function entity_mouseleave(d)
    {
	unclassify_all_entities();
    }

    node_sel.enter().append("circle")
        .attr("class", function(d) 
	      {
		  var parts = ["entity"];
		  if ( d.entity.id === focused_id )
		      parts.push("focused_entity");
		  return parts.join(" ");
	      })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return d.size; })
	.attr("style", function(d) { return d.pattern_id ? "fill: url(#" + d.pattern_id + ")" : ""; })
	.on("mouseenter", entity_mouseenter)
	.on("mouseleave", entity_mouseleave)
        .call(force.drag);
    node_sel.exit().remove();

    // vertices labels
    var text_sel = vis.selectAll("text")
	.data(d3_nodes, function(d) { return d.name; });
    text_sel.enter().append("text").attr("class", "handle").text(function(d) { return d.handle; });
    text_sel.exit().remove();


    // http://bl.ocks.org/benzguo/4370043
    function rescale()
    {
	trans=d3.event.translate;
	scale=d3.event.scale;
	vis.attr("transform",
		 "translate(" + trans + ")"
		 + " scale(" + scale + ")");
    }

    function tick()
    {
	link_sel.attr("d",
		  function(d)
		  {
		      var dx = d.target.x - d.source.x,
			  dy = d.target.y - d.source.y,
			  dr = d.link.kind === "blood" ? 0 : (300 / d.link_num);
		      return "M" + d.source.x + "," + d.source.y + 
			  "A" + dr + "," + dr + " 0 0,1 " + 
			  d.target.x + "," + d.target.y;
		  });

        node_sel
	    .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

	text_sel
            .attr("transform", function(d) { return "translate(" + (d.x) + "," + (d.y - d.size) + ")"; });
    }
}
