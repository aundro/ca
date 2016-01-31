
diam_focused = 80
diam_others = 60
links_distances = {
    "infant-of" : diam_focused * 2,
    undefined : diam_focused * 4
}
MAX_HIGHLIGHT_NEIGHBORS_DEPTH = 1

function layout()
{
        var focused_id = window.get_search_param("id");
        var levels = parseInt(window.get_search_param("levels"));
        if ( isNaN(levels) )
	        levels = 1;

        function sizer(entity)
        {
	        return (entity.get_id() === focused_id ? diam_focused : diam_others) / 2;
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

        function d3_link_concerns(d3_link, entity0, entity1)
        {
	        return d3_link.source.entity === entity0 && d3_link.target.entity === entity1
                        || d3_link.source.entity === entity1 && d3_link.target.entity === entity0;
        }

        function d3_link_exists(entity0, entity1, link)
        {
	        var i, n, cur;
	        for ( i = 0, n = d3_links.length; i < n; ++i )
	        {
	                cur = d3_links[i];
	                if ( cur.link.kind === link.kind
                             && d3_link_concerns(cur, entity0, entity1) )
		                return cur;
	        }
        }

        var handled_nodes = [entity];
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
	        var pics = entity.get_pics(), pic, pat_id, dim;
	        if ( pics.length )
	        {
	                pic = pics[0];
	                pat_id = "pattern_" + entity.get_id();
	                dim = entity.get_id() === focused_id ? diam_focused : diam_others;
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
                function handle_link(link, other, direction, linkset)
                {
                        // recurse add new neighbors
                        other_node = import_neighbors(other, levels - 1);

                        if ( other_node )
                        {
		                if ( ! d3_link_exists(entity, other, link) )
		                {
			                d3_links.push({
			                        source : entity_node,
			                        target : other_node,
			                        link : link,
			                        link_num : linkset.links.indexOf(link) + 1
			                });
		                }
                        }
                }
                entity.for_each_link(Entity.LINK_DIR_BOTH, handle_link);
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
	                .attr("x", "-20")
	                .attr("y", "-20")
	                .attr("width", "500")
	                .attr("height", "500");
	        filter.append("feOffset")
	                .attr("in", "SourceAlpha")
	                .attr("result", "offout")
	                .attr("dx", "10")
	                .attr("dy", "5");
	        filter.append("feGaussianBlur")
	                .attr("in", "offout")
	                .attr("result", "offsetblur")
	                .attr("stdDeviation", "15");
	        filter.append("feBlend")
	                .attr("in", "SourceGraphic")
	                .attr("in2", "offsetblur")
	                .attr("mode", "normal");

	        filter = defs.append("filter");
	        filter.attr("id", "highlit_link_depth_" + i)
	                .attr("x", "-20")
	                .attr("y", "-20")
	                .attr("width", "10000")
	                .attr("height", "10000");
	        filter.append("feOffset")
	                .attr("in", "SourceAlpha")
	                .attr("result", "offout")
	                .attr("dx", "0")
	                .attr("dy", "0");
	        filter.append("feGaussianBlur")
	                .attr("in", "offout")
	                .attr("result", "offsetblur")
	                .attr("stdDeviation", "3");
	        filter.append("feBlend")
	                .attr("in", "SourceGraphic")
	                .attr("in2", "offsetblur")
	                .attr("mode", "normal")
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
	        if ( d.link.kind === "infant-of" )
	        {
                        var sire = d.source.entity.get_sire();
	                if ( is_marker_start && d.target.entity === sire
                          || !is_marker_start && d.source.entity === sire )
	                {
		                marker.push("url(#marker_blood_");
		                marker.push((is_marker_start && d.target.entity === sire) ? "in" : "out");
		                if ( is_marker_start && d.source.entity.get_id() === focused_id
                                  || !is_marker_start && d.target.entity.get_id() === focused_id )
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
	        {
	                node_sel.attr("filter", "");
	                link_sel.attr("filter", "");
	        }
        }

        function get_svg_node(entity)
        {
	        return node_sel.filter(function (d) { return d.entity === entity; });
        }

        function get_svg_link(e0, e1)
        {
	        return link_sel.filter(function (d) { return d3_link_concerns(d, e0, e1); })
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
		                        get_svg_link(entity, neighbor)
			                        .attr("filter", "url(#highlit_link_depth_" + depth + ")");
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

        var side_panel = new EntityViewer(
	        "#side-panel",
	        {
	                body_id_handler : function(id)
	                {
		                var entity = get_entity_by_id(id);
		                var repl_url = window.get_replacement_url(
		                        {
			                        "id" : id
		                        },
		                        {
		                        });
		                return "<a href=\"" + repl_url +  "\">" + entity.get_name() + "</a>";
	                }
	        });
        if ( side_panel.restore_entity_from_url() )
	        side_panel.show();
        function entity_show(d)
        {
	        side_panel.show_entity(d.entity);
	        side_panel.show();
        }

        node_sel.enter().append("circle")
                .attr("class", function(d) 
	              {
		              var parts = ["entity"];
		              if ( d.entity.get_id() === focused_id )
		                      parts.push("focused_entity");
		              return parts.join(" ");
	              })
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr("r", function(d) { return d.size; })
	        .attr("style", function(d) { return d.pattern_id ? "fill: url(#" + d.pattern_id + ")" : ""; })
	        .on("mouseenter", entity_mouseenter)
	        .on("mouseleave", entity_mouseleave)
	        .on("click", entity_show)
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
			                  dr = d.link.kind === "infant-of" ? 0 : (300 / d.link_num);
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
