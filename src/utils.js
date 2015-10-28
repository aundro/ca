
// function parse_el_cheapo_descriptions(content_id, block_sep, block_handlers)
// {
//         var raw_el = document.getElementById(content_id);
//         var descs = raw_el.innerText.split(block_sep);
//         return descs.map(
//                 function (desc)
//                 {
//                         return block_handlers.instantiate(desc);
//                 })
//         return arr;

// }

function parse_el_cheapo_description(raw_desc, handlers)
{
        var Parse = {
                INITIAL : 0,
                HEADER : 1,
                BODY : 2
        };
        var currently = Parse.INITIAL;
        var lines = raw_desc.split("\n"), i, n, line;
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
                                handlers.header_line.call(handlers.scope, line);
                        }
                        else // Parse.BODY
                        {
                                handlers.body_line.call(handlers.scope, line);
                        }
                }
                else
                {
                        if ( currently === Parse.HEADER )
                                currently = Parse.BODY;
                }
        }
}

window.search_params_get = {};
(function ()
 {
         var tele;
         var kvps = location.search.replace('\?','').split('&');
         var i, n, kvp;
         for ( i = 0, n = kvps.length; i < n; ++i )
         {
                 kvp = kvps[i].split("=");
                 if ( kvp.length !== 2 )
                 {
                         console.log("Ignoring malformed \"" + kvps[i] + "\"");
                         continue;
                 }
                 window.search_params_get[kvp[0]] = decodeURIComponent(kvp[1]);
         }
 })();

