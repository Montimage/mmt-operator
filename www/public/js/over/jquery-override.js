jQuery.fn.getWidgetParent = function(){
    var o = $(this[0]) // It's your element
    return o.parents().filter(".grid-stack-item");
}

jQuery.fn.getWidgetContentOfParent = function(){
    var o = $(this[0]) // It's your element
    var widget = o.parents().filter(".grid-stack-item");
    return widget.find(".grid-stack-item-content");
}

jQuery.fn.flash = function(){
    var duration = 500;
    var current = this.css( 'background-color' );
    this.animate( { "background-color": '#FF0000' }, duration / 2 );
    this.animate( { "background-color": current }, duration / 2 );

}
