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