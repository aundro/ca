
function Link(kind)
{
        this.kind = kind;
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
                                var match = this._LINK_REGEX.exec(line), body, link;
                                if ( !match )
                                {
                                        if ( this.links.length <= 0 )
                                                throw "No link yet";
                                        // additional line for last link
                                        link = this.links[this.links.length - 1]
                                        body = line;
                                }
                                else
                                {
                                        link = new Link(match[1]);
                                        this.links.push(link);
                                        body = match[2];
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

LinkSet.prototype._LINK_REGEX = new RegExp("^([a-zA-Z0-9]*):\\s*(.*)")

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

window.linksets = []

function init_links()
{
        var data = document.getElementById("links");
        var descs = data.innerText.split("EOL");
        descs.forEach(
                function (desc) {
                        window.linksets.push(new LinkSet(desc));
                });
        return true;
}
