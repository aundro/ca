
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
                                var match = this._LINK_REGEX.exec(line), match_val, link;
                                if ( !match )
                                {
                                        if ( this.links.length <= 0 )
                                                throw "No link yet";
                                        // additional line for last link
                                        link = this.links[this.links.length - 1]
                                        match_val = line;
                                }
                                else
                                {
                                        link = new Link(match[1]);
                                        this.links.push(link);
                                        match_val = match[2];
                                }
                                link.body.push(match_val);
                        }
                });

        if ( !this.from || !this.to )
                throw "Missing <from>::<to> relationship from \"" + raw_desc + "\"";
}

LinkSet.prototype._LINK_REGEX = new RegExp("^([a-zA-Z0-9]*):\\s*(.*)")

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
