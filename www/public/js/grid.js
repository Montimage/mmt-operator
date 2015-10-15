var Grid = {};

Grid.load_grid = function ( serialized_data, grid_stack ) {
	if( grid_stack == undefined )
		grid_stack = '.grid-stack';

	var options = {
			resizable: {
				handles: 'e, s, w'
			},
			width: 12,
			cell_height: 100,
			vertical_margin: 20,
			draggable: {handle: '.grid-stack-item-header', scroll: true, appendTo: 'body'}
	};

	$(grid_stack).gridstack(options);

	grid = $(grid_stack).data('gridstack');

	grid.remove_all();

	var items = serialized_data; //GridStackUI.Utils.sort( serialized_data, -1 );
	_.each(items, function (node) {
		var header = "", 
		setting = '<span class="grid-stack-item-setting"><span class="glyphicon glyphicon-cog"/></span>';
		if( node.title )
			header = '<span class="grid-stack-item-header">' + node.title + '</span>';
		if( node.setting_button === false)
			setting  = '';

		grid.add_widget($('<div id="'+ node.id +'"><div class="grid-stack-item-content"/>'
				+ header
				+ setting
				+ '</div>'),
				node.x, node.y, node.width, node.height);
	}, grid);
};

Grid.get_grid = function () {
	var serialized_data = _.map($('.grid-stack > .grid-stack-item:visible'), function (el) {
		el = $(el);
		var node = el.data('_gridstack_node');
		return {
			x: node.x,
			y: node.y,
			width: node.width,
			height: node.height,
			id: el.attr('id')
		};
	});
	return serialized_data;

};
