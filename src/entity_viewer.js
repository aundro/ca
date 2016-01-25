
function EntityViewer(id, opts)
{
    this.opts = opts || {}
    if ( !this.opts["body_id_handler"] )
	this.opts["body_id_handler"] = EntityViewer._DEFAULT_BODY_ID_HANDLER;
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
    this.el.select(".brief").html(this._process_text(entity.brief || ""));
    this.el.select(".body").html(this._process_text(entity.body.join("")));
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
};

EntityViewer.prototype._process_text = function(text)
{
    text = text.replace(EntityViewer._REGEX_ID_REF, this._bounce_to_body_id_handler.bind(this));
    return text;
};

EntityViewer.prototype._bounce_to_body_id_handler = function(clob)
{
    return this.opts["body_id_handler"](clob.substr(1)); // drop the '@'
}

EntityViewer._REGEX_ID_REF = RegExp("@" +  window.utils.REGEX_FRAGMENT_ID, "g");

EntityViewer._DEFAULT_BODY_ID_HANDLER = function(id)
{
    var entity = get_entity_by_id(id);
    return entity ? entity.name : id;
};
