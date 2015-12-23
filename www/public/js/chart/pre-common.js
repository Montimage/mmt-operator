var Loading = function( ){
    this.chartLoaded = 0;
    this.totalChart  = 0;
    var _his = this;
    this.onChartLoad = function(){
        _his.chartLoaded ++;
        
        var ts = (new Date()).getTime() - ts_start;
        console.log( "renderd " + _his.chartLoaded + ", took " + ts + " ms" );
        
        if( _his.chartLoaded >= _his.totalChart )
            setTimeout( function( l ){
                l.onHide();
            }, 500, _his );
    }

    this.onHide = function(){
        $("#waiting").hide();
    }
    
    this.onShowing = function(){
        $("#waiting").show();
        _his.chartLoaded = 0;
        ts_start = (new Date()).getTime();
    }
}

var loading = new Loading();
MMTDrop.callback = {
    chart : {
        afterRender : loading.onChartLoad
    }
};

var ts_start = 0;

$( function(){
    ts_start = (new Date()).getTime();
    //loading.onHide();
} );

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