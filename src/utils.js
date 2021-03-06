
(function ()
 {
     function assert(condition, message)
     {
	 if (!condition)
	 {
             message = message || "Assertion failed";
             if (typeof Error !== "undefined") {
		 throw new Error(message);
             }
             throw message; // Fallback
	 }
     }
     if ( typeof(window.assert) === "undefined" )
	 window.assert = assert;
 }) ();


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

window.get_search_param = null;
window.get_anchor_param = null;
(function ()
 {
     function make_kvps_parser(getter)
     {
	 function parse()
	 {
             var i, n, kvp, obj = {}, kvps = getter().split('&');
             for ( i = 0, n = kvps.length; i < n; ++i )
             {
		 kvp = kvps[i].split("=");
		 if ( kvp.length !== 2 )
		 {
                     console.log("Ignoring malformed \"" + kvps[i] + "\"");
                     continue;
		 }
		 obj[kvp[0]] = decodeURIComponent(kvp[1]);
             }
	     return obj;
	 }
	 return parse;
     }

     function make_kvp_getter(kvps_getter)
     {
	 function get(param)
	 {
	     return kvps_getter()[param];
	 }
	 return get;
     }


     window.get_search_params = make_kvps_parser(function() { return location.search.replace('\?', ''); });
     window.get_search_param = make_kvp_getter(window.get_search_params);

     window.get_anchor_params = make_kvps_parser(function() { return location.hash.replace('#', ''); });
     window.get_anchor_param = make_kvp_getter(window.get_anchor_params);

     function make_kvp_setter(kvps_getter, setter)
     {
	 function set(param, value)
	 {
	     var kvps = kvps_getter();
	     if ( value )
		 kvps[param] = value;
	     else
		 delete kvps[param];
	     var serialized = [], id;
	     for ( id in kvps )
		 if ( kvps.hasOwnProperty(id) )
		     serialized.push(id + "=" + encodeURIComponent(kvps[id]));
	     setter(serialized.join("&"));
	 }
	 return set;
     }
     window.set_search_param = make_kvp_setter(window.get_search_params, function(kvps_str) { location.hash = '?' + kvps_str; });
     window.set_anchor_param = make_kvp_setter(window.get_anchor_params, function(kvps_str) { location.hash = '#' + kvps_str; });

     window.get_replacement_url = function(search_kvps, anchor_kvps)
     {
	 // http://stackoverflow.com/questions/3213531/creating-a-new-location-object-in-javascript
	 var a = document.createElement("a");
	 a.href = window.location.href;
	 var id, search_setter = make_kvp_setter(
	     make_kvps_parser(function() { return a.search.replace('\?', ''); }),
	     function(kvps_str) { a.search = '?' + kvps_str; });
	 for ( id in search_kvps )
	     if ( search_kvps.hasOwnProperty(id) )
		 search_setter(id, search_kvps[id]);
	 
	 // FIXME: Same for anchor!
	 // alert(a.outerHTML);
	 return a.href;
     }
 })();

function Utils()
{
}

Utils.REGEX_FRAGMENT_ID = "[a-zA-Z0-9_\\-]*";

Utils.extend = function(r, s, px)
{
        assert(r && s);
        var sp = s.prototype, rp = Object.create(sp);
        r.prototype = rp;

        rp.constructor = r;
        r.superclass = sp;

        if (s != Object && sp.constructor == Object.prototype.constructor)
        {
                sp.constructor = s;
        }

        if (px)
        {
                var id;
                for ( id in px )
                        if ( px.hasOwnProperty(id) )
                                rp[id] = px[id];
        }

        return r;
};
window.utils = Utils;

// Inheritance


Function.prototype.inheritsFrom = function( parentClassOrObject )
{
	if ( parentClassOrObject.constructor == Function ) 
	{ 
		//Normal Inheritance 
                this.prototype = new parentClassOrObject;
                this.prototype.constructor = this;
                this.prototype.parent = parentClassOrObject.prototype;
	} 
	else 
	{ 
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	} 
	return this;
} 


