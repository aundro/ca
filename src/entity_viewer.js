
function EntityViewer(id)
{
    this.el = d3.select(id);
    this.original_html = this.el.html();
}

EntityViewer.prototype.show = function()
{
    return this.set_visible(true);
}

EntityViewer.prototype.hide = function()
{
    return this.set_visible(false);
}

EntityViewer.prototype.set_visible = function(vis)
{
    this.el.style("visibility", vis ? "visible" : "hidden");
};

EntityViewer.prototype.show_entity = function(entity)
{
    this.el.html(this.original_html);
    this.el.select(".name").html(entity.name);
    if ( entity.pics )
    {
	parts = entity.pics.split(",").map(
	    function (one_pic)
	    {
		return "<img src='Photos/" + one_pic + "'></img>";
	    });
	this.el.select(".pics").html(parts.join(""));
    }
    this.el.select(".brief").html(entity.brief || "");
    this.el.select(".body").html(entity.body);
    window.set_anchor_param("view-entity", entity.id);
};

EntityViewer.prototype.restore_entity_from_url = function()
{
    var view_entity = window.get_anchor_param("view-entity"), entity;
    if ( view_entity )
    {
	entity = get_entity_by_id(view_entity);
	if ( entity )
	{
	    this.show_entity(entity);
	    return true;
	}
    }
    return false;
}
