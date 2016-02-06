
function TemplateWidget(id, opts, cssClass)
{
        this.opts = opts || {}
        this.el = d3.select(id);
        this.original_html = this.el.html();
        if ( cssClass )
                this.el.classed(cssClass, true);
}

TemplateWidget.prototype.show = function()
{
        return this.set_visible(true);
}

TemplateWidget.prototype.hide = function()
{
        return this.set_visible(false);
}

TemplateWidget.prototype.set_visible = function(vis)
{
        this.el.style("visibility", vis ? "visible" : "hidden");
};
