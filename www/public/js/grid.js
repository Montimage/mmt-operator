var Grid = {};

Grid.load_grid = function ( serialized_data, grid_stack ) {
	if( grid_stack == undefined )
		grid_stack = '.grid-stack';

	var options = {
			resizable: {
				handles: 'e, s, w, se'
			},
			width: 12,
			cell_height: 60,
			vertical_margin: 20,
			draggable: {handle: '.grid-stack-item-header', scroll: true, appendTo: 'body'}
	};

	$(grid_stack).gridstack(options);

	var grid = $(grid_stack).data('gridstack');

	grid.remove_all();

	var items = serialized_data; //GridStackUI.Utils.sort( serialized_data, -1 );
	_.each(items, function (node) {
		var header = "";
		var type = node.type;
		if( type == undefined )
			type = "success";
		
		var bg     = " btn-" + type; 
		
		if( node.title )
			header = '<span class="grid-stack-item-header '+ bg +'" id="'+ node.id+'-content-header">' + node.title + '</span>';

		grid.add_widget($('<div id="'+ node.id +'" data-title="'+ node.title +'" data-type="'+ type +'" ><div id="'+ node.id +'-content" class="grid-stack-item-content"><div class="center-block loading"><i class="fa fa-refresh fa-spin fa-4x"></i></div></div>'
				+ header
				+ '</div>'),
				node.x, node.y, node.width, node.height);
		
		var bgcolor = $("#" + node.id + "-content-header").css("background-color");
		$("#" + node.id + "-content").css("border-color", bgcolor);
		$("#" + node.id + "-content-setting").css("border-color", bgcolor);
	}, grid);
	
	//drag and drop widget to deleteBtn
	$(function() {
	    $( "#deleteBtn" ).droppable({
	    	//accept:      ".grid-stack-item-header",
	    	activeClass: "btn-warning",
	    	hoverClass:  "btn-danger",
	    	drop: function( event, ui ) {
	    	  console.log("drop");
	      }
	    });
	  });
};

Grid.get_grid = function ( grid_stack ) {
	if( grid_stack == undefined )
		grid_stack = ".grid-stack";
	
	var serialized_data = _.map($(grid_stack + ' > .grid-stack-item:visible'), function (el) {
		el = $(el);
		var node = el.data('_gridstack_node');
		var id = el.attr('id');
		return {
			x: node.x,
			y: node.y,
			width: node.width,
			height: node.height,
			id: id,
			title: el.data('title'),
			type: el.data('type'),
		};
	});
	return serialized_data;

};


Grid.together = function( serialized_data, grid_stack ) {
	if( grid_stack == undefined )
		grid_stack = ".grid-stack";
	
	var key = "grid-data";

	var add_reset_button = function(){
		$("#toolbar ul.nav").append( $('<li> <button title="Reset the gird" id="resetGridBtn" type="button" class="btn btn-default btn-block"> <span class="glyphicon glyphicon-refresh"/>  </button> </li>') );
		
		$("#resetGridBtn").on('click', function(){
			MMTDrop.tools.localStorage.remove( key );
			location.reload();
		});
	};
	
	var data = MMTDrop.tools.localStorage.get( key );
	if( data == undefined )
		data = serialized_data;
	else
		add_reset_button();
	
	Grid.load_grid( data, grid_stack );
	$(grid_stack).on('change', function (e, items) {
	    var data = Grid.get_grid( grid_stack );
	    MMTDrop.tools.localStorage.set( key, data );
	    
	    var $btn = $("#resetGridBtn");
	    if( $btn.length == 0 )
	    	add_reset_button();
	});
};