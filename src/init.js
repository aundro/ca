
(function () {
        var layers = [];
        var currently_parsing = null;
        function register_layer(id)
        {
                assert(layers.indexOf(id) === -1);
                layers.push(id);
        }

        function get_layers()
        {
                return layers.slice();
        }

        function import_desc(raw_desc)
        {
                var data = Entity.parse_raw_desc(raw_desc);
                var entity = get_entity_by_id(data.id);
                if ( entity )
                        entity.import_layer_data(data);
                else
                        window.entities.push(new Entity(data));
        }

        function parse_layer(id)
        {
                assert(currently_parsing === null);
                currently_parsing = id;
                var el = document.getElementById(id);
                var descs = el.innerText.split("EOE");
                descs.forEach(import_desc);
                currently_parsing = null;
        }

        function parse_layers(opts)
        {
                opts = opts || {};
                var i, n;
                //
                for ( i = 0, n = layers.length; i < n; ++i)
                        parse_layer(layers[i]);

                // at this point, all entities should be registered. Finalize links!
                for ( i = 0, n = window.entities.length; i < n; ++i )
                        window.entities[i].resolve_links();
        }

        function get_layer_currently_being_parsed(or_fail)
        {
                var cp = currently_parsing;
                if ( or_fail && !cp )
                        throw new Error("Unexpected unavailable currently-being-parsed layer")
                return cp;
        }

        window.get_layers = get_layers;
        window.register_layer = register_layer;
        window.parse_layers = parse_layers;
        window.get_layer_currently_being_parsed = get_layer_currently_being_parsed;
}) ();
