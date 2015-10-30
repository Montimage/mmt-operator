var Grid = {};

Grid.add_widget = function (node) {
    var grid = Grid.grid;
    
    var header = "";
    var type = node.type;
    if (type == undefined)
        type = "success";

    var bg = " btn-" + type;

    if (node.title)
        header = '<span class="grid-stack-item-header ' + bg + '" id="' + node.id + '-content-header">' + node.title + '</span>';

    grid.add_widget($('<div id="' + node.id + '" data-title="' + node.title + '" data-type="' + type + '" data-user="' + encodeURI(JSON.stringify(node.userData)) + '" ><div id="' + node.id + '-content" class="grid-stack-item-content"><div class="center-block loading"><i class="fa fa-refresh fa-spin fa-4x"></i></div></div>' + header + '</div>'),
        node.x, node.y, node.width, node.height);

    var bgcolor = $("#" + node.id + "-content-header").css("background-color");
    $("#" + node.id + "-content").css("border-color", bgcolor);
    $("#" + node.id + "-content-setting").css("border-color", bgcolor);
    return grid;
}

Grid.load_grid = function (serialized_data, grid_stack) {
    var _this = this;

    if (grid_stack == undefined)
        grid_stack = '.grid-stack';

    var options = {
        resizable: {
            handles: 'e, s, w, se'
        },
        width: 12,
        cell_height: 60,
        vertical_margin: 20,
        draggable: {
            handle: '.grid-stack-item-header',
            scroll: true,
            appendTo: 'body'
        }
    };

    $(grid_stack).gridstack(options);

    var grid = $(grid_stack).data('gridstack');
    Grid.grid = grid;
    grid.remove_all();

    var items = serialized_data; //GridStackUI.Utils.sort( serialized_data, -1 );
    _.each(items, function (node) {
        _this.add_widget(node, grid);
    }, grid);

    //drag and drop widget to deleteBtn
    $(function () {
        var $deleteBtn = $("#deleteBtn");
        var $gridStack = $(grid_stack);
        var onDragging = false;
        var onOverDeleteBtn = false;

        var canBeDeleted = function () {
            var t = $(grid_stack + ' > .grid-stack-item:visible');
            return t.length > 2;
        };

        $gridStack.on("resizestop", function( event, ui ){
            var el = $(event.target); 
            el.trigger('widget-resized', [el, el.width(), el.height()]);
        });
        
        $gridStack.on("dragstart", function (event, ui) {
            onDragging = true;
            if (!canBeDeleted()) return;
            $deleteBtn.addClass("btn-warning");
        });

        $gridStack.on("dragstop", function (event, ui) {
            $deleteBtn.removeClass("btn-warning");
            if (onDragging && onOverDeleteBtn) {
                if (!canBeDeleted()) return;

                onDragging = false;

                var el = $(event.target);
                var conf = confirm("Do you want to delete the report [" + el.data('title') + "]");
                $deleteBtn.removeClass("btn-danger");
                if (conf == false) return;

                grid.remove_widget(el);

            }
        });

        $deleteBtn.on("mouseenter", function () {
            if (!canBeDeleted()) return;
            if (!onDragging) return;
            onOverDeleteBtn = true;
            $deleteBtn.addClass("btn-danger");
        });
        $deleteBtn.on("mouseleave", function () {
            onOverDeleteBtn = false;
            if (!onDragging) return;

            $deleteBtn.removeClass("btn-danger");
        });
        $deleteBtn.on("click", function(){
            alert("Drag and drop a report here to delete it."); 
        });
    });
    return grid;
};

Grid.get_grid = function (grid_stack) {
    if (grid_stack == undefined)
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
            userData: JSON.parse(decodeURI(el.data("user")))
        };
    });
    return serialized_data;

};


Grid.together = function (serialized_data, grid_stack) {
    if (grid_stack == undefined)
        grid_stack = ".grid-stack";

    var key = "grid-data";

    var add_reset_button = function () {
        $("#toolbar ul.nav").append($('<li> <button title="Reset the gird" id="resetGridBtn" type="button" class="btn btn-default btn-block"> <span class="glyphicon glyphicon-refresh"/>  </button> </li>'));

        $("#resetGridBtn").on('click', function () {
            if (confirm("Are you sure to reset this grid?") == false)
                return;

            MMTDrop.tools.localStorage.remove(key);
            location.reload();
        });
    };

    var data = MMTDrop.tools.localStorage.get(key);
    if (data == undefined)
        data = serialized_data;
    else
        add_reset_button();

    Grid.load_grid(data, grid_stack);
    $(grid_stack).on('change', function (e, items) {
        
        Grid.save_grid( grid_stack, key );
        
        var $btn = $("#resetGridBtn");
        if ($btn.length == 0)
            add_reset_button();
    });
    return data;
};

Grid.save_grid = function( grid_stack, key ){
    key = key || "grid-data";
    var data = Grid.get_grid(grid_stack);
    MMTDrop.tools.localStorage.set(key, data);
}