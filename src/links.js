
// ---------------------------------------------------------------------------
function Link(linkset, kind, metadata)
{
        this.linkset = linkset;
        this.kind = kind;
        this.metadata = metadata || {};
        this.body = [];
}

// ---------------------------------------------------------------------------
function LinkSet(source, target)
{
        assert(typeof(source) === "string");
        assert(typeof(target) === "string");
        this.source = source;
        this.target = target;
        this.links = [];
}

// ---------------------------------------------------------------------------
LinkSet.prototype.resolve = function()
{
        assert(typeof(this.source) === "string");
        assert(typeof(this.target) === "string");
        this.source = get_entity_by_id(this.source, true);
        this.target = get_entity_by_id(this.target, true);
}

// ---------------------------------------------------------------------------
LinkSet.prototype.add_link = function(kind, metadata)
{
    var link = new Link(this, kind, metadata);
    this.links.push(link);
    return link;
}
