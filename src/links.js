
function Link(kind, metadata)
{
        this.kind = kind;
        this.metadata = metadata;
        this.body = [];
}

function LinkSet(raw_desc)
{
        this.raw = raw_desc;
        this.from = null;
        this.to = null;
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
                                
                                this.from = parts[0];
                                this.to = parts[1];
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

        if ( !this.from || !this.to )
                throw "Missing <from>::<to> relationship from \"" + raw_desc + "\"";

        if ( !get_entity_by_id(this.from) )
                throw "Unknown entity with 'from' id: \"" + this.from + "\"";

        if ( !get_entity_by_id(this.to) )
                throw "Unknown entity with 'to' id: \"" + this.to + "\"";
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


function get_linksets_for_id(id)
{
    var i, n, found = [], cur;
    for ( i = 0, n = window.linksets.length; i < n; ++i )
    {
        cur = window.linksets[i];
        if ( cur.from === id || cur.to === id )
            found.push(cur);
    }
    return found;
}

function get_linkset(from, to, opts)
{
    opts = opts || {};
    var tmp;
    if ( from > to )
    {
	tmp = from;
	from = to;
	to = tmp;
    }

    var linksets = get_linksets_for_id(from), linkset, i, n;
    for ( i = 0, n = linksets.length; i < n && !linkset; ++i )
	if ( linksets[i].from === from && linksets[i].to === to )
	    linkset = linksets[i];

    if ( !linkset && opts.create )
    {
	linkset = new LinkSet(from + "::" + to);
	window.linksets.push(linkset);
    }
    return linkset;
}

window.linksets = []

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
			linkset = get_linkset(ent.id, primo.id, {create : true});
			linkset.add_link("primogene").body.push("Primogene");
		    }
		}
	    }
	}
    }

    return true;
}
