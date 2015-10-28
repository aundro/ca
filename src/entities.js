
function Entity(raw_desc)
{
        this.raw = raw_desc;
        this.id = null;
        this.name = null;
        this.type = null;
        this.body = [];
        this.tags = [];

        parse_el_cheapo_description(
                raw_desc,
                {
                        scope : this,
                        header_line : function (line)
                        {
                                var match = this._HEADER_LINE_REGEX.exec(line);
                                if ( !match )
                                        throw "Couldn't parse header line: \""
                                                + line + "\"";
                                var match_kw = match[1];
                                var match_val = match[2];
                                if ( match_kw === "tags" )
                                        match_val = ",".split(match_val).map(
                                                function (tag)
                                                {
                                                        return tag.trim();
                                                });
                                this[match_kw] = match_val;
                        },
                        body_line : function (line)
                        {
                                this.body.push(line);
                        }
                });

        if ( !this.id ) throw "Missing 'id' from \"" + raw_desc + "\"";
        if ( !this.type ) throw "Missing 'type' from \"" + raw_desc + "\"";
        if ( !this.name ) throw "Missing 'name' from \"" + raw_desc + "\"";

        if ( this.KNOWN_TYPES.indexOf(this.type) < 0 )
                throw "Invalid 'type': \"" + this.type + "\"";

        if ( this.is_actor() )
        {
                if ( !this.group )
                        throw "Missing group for \"" + this.group + "\"";

                this.influence = parseInt(this.influence);
                if ( !this.influence || isNaN(this.influence) )
                        throw "Missing influence for \"" + this.id + "\"";
        }

        if ( this.body.length <= 0 )
                throw "No description for \"" + raw_desc + "\"";
}

// ---------------------------------------------------------------------------
Entity.prototype._HEADER_LINE_REGEX = new RegExp("([a-z]*):\\s*(.*)");

// ---------------------------------------------------------------------------
Entity.prototype.KNOWN_TYPES = [
        "sect",
        "clan",
        "vampire",
        "ghoul"
];

// ---------------------------------------------------------------------------
Entity.prototype.is_clan = function()
{
        return this.type === "clan";
};

// ---------------------------------------------------------------------------
Entity.prototype.is_actor = function()
{
        return this.type === "vampire" || this.type === "ghoul";
};

// ---------------------------------------------------------------------------
Entity.prototype.to_d3_node = function(sizer)
{
        return {
                name : this.name,
                size : sizer(this),
                entity : this
        };
};

function get_entity_by_id(id)
{
        var i, n;
        for ( i = 0, n = window.entities.length; i < n; ++i )
                if ( window.entities[i].id === id )
                        return window.entities[i];
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
