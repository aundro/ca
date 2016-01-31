
// hierarchical tree of entities:
//  - clans
//     - actors (vampires & ghouls)


// ---------------------------------------------------------------------------
//
// ---------------------------------------------------------------------------
function VTree()
{
        // highest sum of influences within a clan
        this.max_clan_influence = 0;

        // 
        this.toplevels = [];
        var i, n, cur;
        for ( i = 0, n = window.entities.length; i < n; ++i )
                this.find_or_create_node(window.entities[i]);

        // compute max clan influence
        for ( i = 0, n = window.entities.length; i < n; ++i )
        {
                cur = window.entities[i];
                if ( cur.is_clan() )
                        this.max_clan_influence = Math.max(
                                this.max_clan_influence,
                                this.compute_clan_influence_sum(
                                        this.find_node(cur.get_id())));
        }
}

// ---------------------------------------------------------------------------
VTree.prototype.compute_clan_influence_sum = function(node)
{
        var i, n, total = 0;
        for ( i = 0, n = node.children.length; i < n; ++i )
                total += node.children[i].entity.influence;
        return total;
};

// ---------------------------------------------------------------------------
VTree.prototype.find_or_create_node = function(entity)
{
        var node = this.find_node(entity.get_id()), parent;
        if ( !node )
        {
                node = new VTree.Node(entity);
                if ( !entity.get_group_id() )
                {
                        // if toplevel, push it in tree right away
                        this.toplevels.push(node);
                }
                else
                {
                        parent = this.find_or_create_node(
                                this.get_entity_for_id(entity.get_group_id()));
                        parent.children.push(node);
                }
        }
        return node;
};

// ---------------------------------------------------------------------------
VTree.prototype.get_entity_for_id = function(id)
{
        var i, n;
        for ( i = 0, n = window.entities.length; i < n; ++i )
                if ( window.entities[i].get_id() === id )
                        return window.entities[i];
        throw "No entity with ID: \"" + id + "\"";
};

// ---------------------------------------------------------------------------
VTree.prototype.find_node = function(id)
{
        return this.find_node1(this.toplevels, id);
};

// ---------------------------------------------------------------------------
VTree.prototype.find_node1 = function(nodes, id)
{
        var i, n, fnd, node;
        for ( i = 0, n = nodes.length; i < n; ++i )
        {
                node = nodes[i];
                if ( node.entity.get_id() === id )
                        return node;

                fnd = this.find_node1(node.children, id);
                if ( fnd )
                        return fnd;
        }
};

// ---------------------------------------------------------------------------
VTree.prototype.to_d3_node = function(node)
{
        var self = this;
        function sizer(e)
        {
                return self.to_d3_node_sizer(e);
        }
        var d3n = node.entity.to_d3_node(sizer);
        d3n.children = node.children.map(this.to_d3_node, this);
        return d3n;
};

// ---------------------------------------------------------------------------
VTree.prototype.to_d3_hierarchy = function()
{
        return {
                // name : "badasses",
                children : this.toplevels.map(this.to_d3_node, this)
        };
};

// ---------------------------------------------------------------------------
VTree.prototype.to_d3_node_sizer = function (entity)
{
        if ( entity.is_actor() )
                return entity.influence;
};


// ---------------------------------------------------------------------------
//
// ---------------------------------------------------------------------------
VTree.Node = function(entity)
{
        this.entity = entity;
        this.children = [];
};
