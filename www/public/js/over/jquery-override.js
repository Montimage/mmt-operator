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

jQuery.fn.setEnable = function( val ){
  if( val == undefined )
    val = true;
  this.prop('disabled', !val );
}

jQuery.fn.disable = function(){
  this.setEnable( false );
}
jQuery.fn.enable = function(){
  this.setEnable( true );
}

jQuery.validator.addMethod( "ipv4", function( value, element ) {
	return this.optional( element ) || value == "localhost" || /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/i.test( value );
}, "Please enter a valid IP v4 address." );
