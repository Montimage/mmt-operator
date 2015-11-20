var Loading = function( ){
    this.chartLoaded = 0;
    this.totalChart  = 0;
    var _his = this;
    this.onChartLoad = function(){
        _his.chartLoaded ++;
        if( _his.chartLoaded >= _his.totalChart )
            $("#waiting").hide();
    }
    
    this.onShowing = function(){
        $("#waiting").show();
        _his.chartLoaded = 0;
    }
}

$( function(){
    $("#waiting").hide();
} );