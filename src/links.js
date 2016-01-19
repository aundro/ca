
function Link(kind, metadata)
{
        this.kind = kind;
        this.metadata = metadata;
        this.body = [];
}

function LinkSet(raw_desc)
{
        this.raw = raw_desc;
    var from = null;
    var to = null;
        this.links = []

        parse_el_cheapo_description(
                raw_desc,
                {
                        scope : this,
                        header_line : function (line)
                        {
                                var parts = line.split("::");
                                if ( parts.length !== 2 )
                                        throw "Couldn't parse header line: \""
                                        + line + "\"";
                                
                                from = parts[0];
                                to = parts[1];
                        },
                        body_line : function (line)
                        {
			        var match = this._BLOOD_LINK_REGEX.exec(line), body, link;
			        if ( match )
           		        {
				    // FIXME: Should always make blood the first link!

				    // blood link
				    link = this.add_link("blood", {"sire" : match[1]});
				    body = match[2];
				}
    			        else
			        {
                                    match = this._LINK_REGEX.exec(line);
                                    if ( match )
                                    {
					// regular link
					if ( match[1] === "blood" ) // blood link, but didn't match regex? Error
					    alert("Invalid 'blood' link: " + line);
				        link = this.add_link(match[1]);
                                        body = match[2];
                                    }
                                    else
                                    {
                                        // additional line for last link
                                        if ( this.links.length <= 0 )
                                                throw "No link yet";
                                        link = this.links[this.links.length - 1]
                                        body = line;
                                    }
				}
                                link.body.push(body);
                        }
                });

        if ( !from || !to )
                throw "Missing <from>::<to> relationship from \"" + raw_desc + "\"";

        this.from = get_entity_by_id(from);
        if ( !this.from )
            throw "Unknown entity with 'from' id: \"" + from + "\"";

        this.to = get_entity_by_id(to);
        if ( !this.to )
            throw "Unknown entity with 'to' id: \"" + to + "\"";
}

// ---------------------------------------------------------------------------
(function ()
 {
     var _ID = "[a-zA-Z0-9_\\-]*"; //
     var _LT = "[a-zA-Z0-9]*";     // link type
     LinkSet.prototype._BLOOD_LINK_REGEX = new RegExp("^blood:(" + _ID + "):\\s*(.*)")
     LinkSet.prototype._LINK_REGEX       = new RegExp("^(" + _LT + "):\\s*(.*)")
 }) ();

// ---------------------------------------------------------------------------
LinkSet.prototype.add_link = function(kind, metadata)
{
    var link = new Link(kind, metadata);
    this.links.push(link);
    return link;
}

// ---------------------------------------------------------------------------
LinkSet.prototype.concerns = function(entity)
{
    return this.from === entity || this.to === entity;
}

// ---------------------------------------------------------------------------
LinkSet.prototype.get_other = function(entity)
{
    if ( !this.concerns(entity) )
	throw Exception("Cannot get other from " + id);
    return this.from === entity ? this.to : this.from;
}

// ---------------------------------------------------------------------------
function get_linksets(entity)
{
    var i, n, found = [], cur;
    for ( i = 0, n = window.linksets.length; i < n; ++i )
    {
        cur = window.linksets[i];
	if ( cur.concerns(entity) )
            found.push(cur);
    }
    return found;
}

// ---------------------------------------------------------------------------
function get_linkset(from, to, opts)
{
    opts = opts || {};
    var tmp;
    if ( from.id > to.id )
    {
	tmp = from;
	from = to;
	to = tmp;
    }

    var linksets = get_linksets(from), linkset, i, n;
    for ( i = 0, n = linksets.length; i < n && !linkset; ++i )
	if ( linksets[i].from === from && linksets[i].to === to )
	    linkset = linksets[i];

    if ( !linkset && opts.create )
    {
	linkset = new LinkSet(from.id + "::" + to.id);
	window.linksets.push(linkset);
    }
    return linkset;
}

window.linksets = []

// ---------------------------------------------------------------------------
function init_links(opts)
{
    opts = opts || {};
    var i, n, ent, primo, group, linkset, link;
    var data = document.getElementById("links");
    var descs = data.innerText.split("EOL");
    descs.forEach(
        function (desc) {
            window.linksets.push(new LinkSet(desc));
        });

    if ( opts.auto_add_primo )
    {
	for ( i = 0, n = window.entities.length; i < n; ++i )
	{
	    ent = window.entities[i];
	    if ( ent.is_actor() && !ent.is_primogene() )
	    {
		group = get_entity_by_id(ent.group);
		if ( group )
		{
		    primo = group.get_primogene();
		    if ( primo )
		    {
			linkset = get_linkset(ent, primo, {create : true});
			linkset.add_link("primogene").body.push("Primogene");
		    }
		}
	    }
	}
    }

    return true;
}
