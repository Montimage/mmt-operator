var Loading = function( ){
    this.chartLoaded = 0;
    this.totalChart  = 0;
    var _his = this;
    this.onChartLoad = function(){
        _his.chartLoaded ++;
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
    }
}

var loading = new Loading();
MMTDrop.callback = {
    chart : {
        afterRender : loading.onChartLoad
    }
};

$( function(){
    //loading.onHide();
} );