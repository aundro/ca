
function LayerList(id, opts)
{
        LayerList.superclass.constructor.call(this, id, opts, "layer-list");
        this.events = d3.dispatch("layer_visibility_changed");
}

Utils.extend(LayerList, TemplateWidget);

LayerList.prototype.init = function()
{
        var i, n, layers = get_layers(), ul, li, id, self = this;
        var ul = d3.select(".contents", this.el).append("ul");
        for ( i = 0, n = layers.length; i < n; ++i )
        {
                id = "cb_" + layers[i];
                li = ul.append("li");
                li.append("input")
                        .attr("type", "checkbox")
                        .attr("id", id)
                        .property("checked", true)
                        .on("change",
                            function ()
                            {
                                    self.on_cb_changed(this); // this == cb
                            });
                li.append("label").attr("for", id).text(layers[i]);
        }
};

LayerList.prototype.on_cb_changed = function(cb)
{
        var vis = !!cb.checked;
        var layer = cb.id.substring(3); // skip "cb_"
        this.events.layer_visibility_changed(layer, vis);
};
