var ts_start = 0;

$( function(){
    ts_start = (new Date()).getTime();
    //loading.onHide();
} );

const Loading = function( ){
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
    };

    this.onHide = function(){
        waiting.hide();
    };

    this.onShowing = function(){
        waiting.show();
        _his.chartLoaded = 0;
        ts_start = (new Date()).getTime();
    };
};

const loading = new Loading();

MMTDrop.callback = {
    chart : {
        afterRender : loading.onChartLoad
    }
};

MMTDrop.setOptions({
   format_payload: true
});


const URL_PARAM = MMTDrop.tools.getURLParameters();
if( URL_PARAM.probe_id )
  URL_PARAM.probe_id = parseInt( URL_PARAM.probe_id );
if( URL_PARAM.app_id )
  URL_PARAM.app_id = "" + URL_PARAM.app_id; //string
else
   URL_PARAM.app_id = "_undefined";

if( URL_PARAM.ts )
  URL_PARAM.ts = parseInt( URL_PARAM.ts );



$(function(){
  //hide animation if 2 consecutif refreshes are less than 10seconds;
  var now = (new Date()).getTime();
  var lastRefresh = MMTDrop.tools.cookie.get("last_load");
  MMTDrop.tools.cookie.set("last_load", now, 1);

  if( lastRefresh == undefined ) lastRefresh = 0;
  if( now - lastRefresh < 10000 ){
    //remove animation
    MMTDrop.tools.createStylesheet('.c3-chart-arc,.c3-chart-lines{animation: none; -ms-animation: none; -moz-animation: none;-webkit-animation: none; opacity:1}');
  }
});



//check browser support ES6
const supportsES6 = function() {
   try {
      new Function("(a = 0) => a");
      return true;
   }
   catch (err) {
      $(function(){
         var msg = "<strong>MMT-Operator might not work properly:</strong><br/><center>The browser does not support <br>ECMAScript 6.</center>";
         MMTDrop.alert.error( msg, 10000 );
      })
      return false;
   }
}();