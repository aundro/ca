
function Widget(id, opts, cssClass)
{
        this.opts = opts || {}
        this.el = d3.select(id);
        this.original_html = this.el.html();
        if ( cssClass )
                this.el.classed(cssClass, true);
}

Widget.prototype.show = function()
{
        return this.set_visible(true);
}

Widget.prototype.hide = function()
{
        return this.set_visible(false);
}

Widget.prototype.set_visible = function(vis)
{
        this.el.style("visibility", vis ? "visible" : "hidden");
};
