
function Entity(raw_desc)
{
        this.raw = raw_desc;
        this.id = null;
        this.name = null;
        this.type = null;
        this.body = null;
        this.tags = [];

        var Parse = {
                INITIAL : 0,
                HEADER : 1,
                BODY : 2
        };
        var currently = Parse.INITIAL;
        var body_lines = [];
        var lines = raw_desc.split("\n"), i, n, line, match, match_kw, match_val;
        for ( i = 0, n = lines.length; i < n; ++i )
        {
                line = lines[i].trim();
                if ( line !== "" )
                {
                        if ( currently === Parse.INITIAL )
                        {
                                currently = Parse.HEADER;
                                --i; // redo line
                                continue;
                        }
                        else if ( currently === Parse.HEADER )
                        {
                                match = this._HEADER_LINE_REGEX.exec(line);
                                if ( !match )
                                        throw "Couldn't parse header line: \""
                                                + line + "\"";
                                match_kw = match[1];
                                match_val = match[2];
                                if ( match_kw === "tags" )
                                        match_val = ",".split(match_val).map(
                                                function (tag)
                                                {
                                                        return tag.trim();
                                                });
                                this[match_kw] = match_val;
                        }
                        else // Parse.BODY
                        {
                                body_lines.push(line);
                        }
                }
                else
                {
                        if ( currently === Parse.HEADER )
                                currently = Parse.BODY;
                }
        }

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

        this.body = body_lines;
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

window.entities = [];

function init_entities()
{
        var data = document.getElementById("data");
        var descs = data.innerText.split("EOE");
        descs.forEach(
                function (desc) {
                        window.entities.push(new Entity(desc));
                });
        return true;
}
