
// ---------------------------------------------------------------------------
function Entity(layer0_data)
{
        // data, organized in 'layers'
        this.layers = [];
        this.import_layer_data(layer0_data, true);
        this._id = this.get_id(); // for debugging purposes only
}

// ---------------------------------------------------------------------------
Entity.prototype.get_id = function()
{
        return this.layers[0].id;
};

// ---------------------------------------------------------------------------
Entity.prototype.toString = function()
{
        return "Entity(id=" + this.get_id() + ")";
}

// ---------------------------------------------------------------------------
Entity.prototype.get_name = function()
{
        return this.layers[0].name;
};

// ---------------------------------------------------------------------------
Entity.prototype.get_handle = function()
{
        return this.layers[0].handle;
};

// ---------------------------------------------------------------------------
Entity.prototype.get_type = function()
{
        return this.layers[0].type;
};

// ---------------------------------------------------------------------------
Entity.prototype.get_group_id = function()
{
        return this.layers[0].group;
};

// ---------------------------------------------------------------------------
Entity.prototype.get_group = function()
{
        return get_entity_by_id(this.get_group_id);
};

// ---------------------------------------------------------------------------
Entity.prototype.get_tags = function()
{
        var i, n, tags = [];
        for ( i = 0, n = this.layers.length; i < n; ++i )
                tags.push.apply(tags, this.layers[i].tags || []);
        return tags;
};

// ---------------------------------------------------------------------------
Entity.prototype.get_body = function()
{
        var i, n, body = [];
        for ( i = 0, n = this.layers.length; i < n; ++i )
                body.push.apply(body, this.layers[i].body || []);
        return body;
}

// ---------------------------------------------------------------------------
Entity.prototype.get_pics = function()
{
        var i, n, pics = [];
        for ( i = 0, n = this.layers.length; i < n; ++i )
                pics.push.apply(pics, this.layers[i].pics || []);
        return pics;
}

// ---------------------------------------------------------------------------
Entity.parse_raw_desc = function(raw_desc)
{
        var data = {
                "__layer_id__" : get_layer_currently_being_parsed(true),
                "body" : [],
                "linksets" : []
        };

        function new_link_to(target, kind, metadata)
        {
                var i, n, linkset = null;
                for ( i = 0, n = data.linksets.length; i < n && !linkset; ++i )
                        if ( data.linksets[i].target === target )
                                linkset = data.linksets[i];

                if ( !linkset )
                {
                        linkset = new LinkSet(target);
                        data.linksets.push(linkset);
                }

                return linkset.add_link(kind, metadata);
        }

        var last_link = null;
        parse_el_cheapo_description(
                raw_desc,
                {
                        header_line : function (line)
                        {
                                var match = Entity._HEADER_LINE_REGEX.exec(line);
                                if ( !match )
                                        throw "Couldn't parse header line: \""
                                                + line + "\"";
                                var match_kw = match[1];
                                var match_val = match[2];
                                if ( match_kw === "tags" || match_kw === "pics" )
                                        match_val = match_val.split(",").map(
                                                function (one)
                                                {
                                                        return one.trim();
                                                });
                                data[match_kw] = match_val;
                                if ( match_kw === "sire" && match_val !== "unknown" )
                                        new_link_to(match_val, "infant-of");
                        },
                        body_line : function (line)
                        {
                                var match = Entity._NEWLINK_LINE_REGEX.exec(line);
                                if ( match )
                                {
                                        last_link = new_link_to(match[1], "type_TBD");
                                        line = match[2];
                                }
                                if ( last_link )
                                        last_link.body.push(line);
                                else
                                        data.body.push(line);
                        }
                });

        if ( !data.id )
                throw "Missing 'id' from \"" + raw_desc + "\"";

        return data;
};

// ---------------------------------------------------------------------------
Entity.prototype.get_data_for_layer = function(layer_id)
{
        var i, n;
        for ( i = 0, n = this.layers.length; i < n; ++i )
                if ( this.layers[i]["__layer_id__"] === layer_id )
                        return this.layers[i];
};

// ---------------------------------------------------------------------------
Entity.prototype.import_layer_data = function(data, first_layer)
{
        var layer_id = data["__layer_id__"];
        function err(msg) { throw new Error(msg + " (for \"" + data.id + "\", layer \"" + layer_id + "\")"); }

        if ( this.get_data_for_layer(layer_id) )
                err("Data for this layer already exists");

        if ( first_layer )
        {
                if ( !data.type ) err("Missing 'type'");
                if ( !data.name ) err("Missing 'name'");
                if ( Entity.KNOWN_TYPES.indexOf(data.type) < 0 )
                        err("Invalid 'type': \"" + data.type + "\"");
                if ( this.is_actor_type(data.type) )
                {
                        if ( !data.sire )
                                err("Missing 'sire'");

                        if ( !data.group )
                                err("Missing 'group'");

                        // if ( typeof(this.influence) === "string" )
                        // {
                        //     this.influence = parseInt(this.influence);
                        //     if ( !this.influence || isNaN(this.influence) )
                        //         throw "Missing influence for \"" + this.get_id() + "\"";
                        // }
                }
        }
        else
        {
                if ( data.type ) err("Inappropriate re-definition of 'type'");
                if ( data.name ) err("Inappropriate re-definition of 'name'");
        }

        this.layers.push(data);
};

// ---------------------------------------------------------------------------
Entity._HEADER_LINE_REGEX = new RegExp("([a-z]*):\\s*(.*)");
Entity._NEWLINK_LINE_REGEX = new RegExp("^\\->\\s*(" + Utils.REGEX_FRAGMENT_ID + ")(.*)");

// ---------------------------------------------------------------------------
Entity.KNOWN_TYPES = [
        "sect",
        "clan",
        "vampire",
        "ghoul"
];

// ---------------------------------------------------------------------------
Entity.prototype.is_clan = function()
{
        return this.get_type() === "clan";
};

// ---------------------------------------------------------------------------
Entity.prototype.is_actor = function()
{
        return this.is_actor_type(this.get_type());
};

// ---------------------------------------------------------------------------
Entity.prototype.is_actor_type = function(t)
{
        return t === "vampire" || t === "ghoul";
};

// ---------------------------------------------------------------------------
Entity.prototype.is_primogene = function()
{
        return this.is_actor() && this.has_tag("primogene");
};

// ---------------------------------------------------------------------------
Entity.prototype.has_tag = function(tag)
{
        return this.get_tags().indexOf(tag) > -1;
};

// ---------------------------------------------------------------------------
Entity.prototype.get_sire = function()
{
        if ( !this.is_actor() )
                return;

        var got = [];
        function on_link(link, other)
        {
                if ( link.kind === "infant-of" )
                {
                        got.push(other);
                        return Entity.LINK_ITER_STOP;
                }
        }
        this.for_each_link(Entity.LINK_DIR_OUTGOING, on_link);
        if ( got.length === 1 )
                return got[0];
};

// ---------------------------------------------------------------------------
Entity.prototype.get_primogene = function()
{
        if ( !this.is_clan() )
                return;

        var i, n, ent;
        for ( i = 0, n = window.entities.length; i < n; ++i )
        {
                ent = window.entities[i];
                if ( ent.is_primogene() && ent.get_group() === this )
                        return ent;
        }
};

// ---------------------------------------------------------------------------
Entity.LINK_ITER_STOP = {}; // return this from 'cb' to stop iterating

Entity.LINK_DIR_OUTGOING = 1 << 0;
Entity.LINK_DIR_INCOMING = 1 << 1;
Entity.LINK_DIR_BOTH = Entity.LINK_DIR_OUTGOING | Entity.LINK_DIR_INCOMING;
// cb(link, other, direction, linkset)
Entity.prototype.for_each_link = function(lid, cb)
{
        assert(typeof(lid) === "number");
        var i, n, lsets, lset, other, j, k, l, m;
        if ( (lid & Entity.LINK_DIR_OUTGOING) !== 0 )
        {
                for ( i = 0, n = this.layers.length; i < n; ++i )
                {
                        lsets = this.layers[i].linksets;
                        for ( j = 0, k = lsets.length; j < k; ++j )
                        {
                                lset = lsets[j];
                                other = lset.target;
                                for ( l = 0, m = lset.links.length; l < m; ++l )
                                        if ( cb(lset.links[l], other, Entity.LINK_DIR_OUTGOING, lset) === Entity.LINK_ITER_STOP )
                                                return Entity.LINK_ITER_STOP;
                        }
                }
        }
        var ent, self = this;
        if ( (lid & Entity.LINK_DIR_INCOMING) !== 0 )
        {
                for ( i = 0, n = window.entities.length; i < n; ++i )
                {
                        ent = window.entities[i];
                        if ( ent === this )
                                continue;
                        function filter(link, other, dir, linkset)
                        {
                                if ( other === self )
                                        return cb(link, ent, Entity.LINK_DIR_INCOMING, linkset);
                        }
                        if ( ent.for_each_link(Entity.LINK_DIR_OUTGOING, filter) === Entity.LINK_ITER_STOP )
                                return Entity.LINK_ITER_STOP;
                }
        }
};

// ---------------------------------------------------------------------------
Entity.prototype.get_neighbors = function()
{
        var neighbors = [];
        function handle_link(link, other) { neighbors.push(other); }
        this.for_each_link(Entity.LINK_DIR_BOTH, handle_link);
        return neighbors;
}

// ---------------------------------------------------------------------------
Entity.prototype.resolve_links = function()
{
        function resolve_layer_links(lidx)
        {
                var i, n;
                for ( i = 0, n = this.layers[lidx]["linksets"].length; i < n; ++i )
                        this.layers[lidx]["linksets"][i].resolve();
        }

        var i, n
        for ( i = 0, n = this.layers.length; i < n; ++i )
                resolve_layer_links.call(this, i);
};

// ---------------------------------------------------------------------------
Entity.prototype.to_d3_node = function(sizer)
{
        return {
                name : this.get_name(),
                handle : this.get_handle() || this.get_name(),
                size : sizer(this),
                entity : this
        };
};

function get_entity_by_id(id, or_fail)
{
        var i, n;
        for ( i = 0, n = window.entities.length; i < n; ++i )
                if ( window.entities[i].get_id() === id )
                        return window.entities[i];

        if ( or_fail )
                throw new Error("Unknown id \"" + id + "\"");
}

window.entities = [];

function init_entities()
{
        var data = document.getElementById("entities");
        var descs = data.innerText.split("EOE");
        descs.forEach(
                function (desc) {
                        window.entities.push(new Entity(desc));
                });
        return true;
}
