
// ---------------------------------------------------------------------------
function Link(kind, metadata)
{
        this.kind = kind;
        this.metadata = metadata || {};
        this.body = [];
}

// ---------------------------------------------------------------------------
function LinkSet(target)
{
        assert(typeof(target) === "string");
        this.target = target;
        this.links = [];
        this.resolved = false;
}

// ---------------------------------------------------------------------------
LinkSet.prototype.resolve = function()
{
        assert(!this.resolved);
        this.target = get_entity_by_id(this.target, true);
        this.resolved = true;
}

// ---------------------------------------------------------------------------
LinkSet.prototype.add_link = function(kind, metadata)
{
    var link = new Link(kind, metadata);
    this.links.push(link);
    return link;
}

// // ---------------------------------------------------------------------------
// function init_links(opts)
// {
//     opts = opts || {};
//     var i, n, ent, primo, group, linkset, link;
//     var data = document.getElementById("links");
//     var descs = data.innerText.split("EOL");
//     descs.forEach(
//         function (desc) {
//             window.linksets.push(new LinkSet(desc));
//         });

//     if ( opts.auto_add_primo )
//     {
// 	for ( i = 0, n = window.entities.length; i < n; ++i )
// 	{
// 	    ent = window.entities[i];
// 	    if ( ent.is_actor() && !ent.is_primogene() )
// 	    {
// 		group = ent.get_group();
// 		if ( group )
// 		{
// 		    primo = group.get_primogene();
// 		    if ( primo )
// 		    {
// 			linkset = get_linkset(ent, primo, {create : true});
// 			linkset.add_link("primogene").body.push("Primogene");
// 		    }
// 		}
// 	    }
// 	}
//     }

//     return true;
// }
