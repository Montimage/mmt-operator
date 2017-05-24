const waiting = {
    hide : function(){
        $("#waiting").hide();
    },
    show : function(){
        $("#waiting").show();
    },
    get: function(){
        return $("#waiting");
    }
}



//Indicate the current page's location within a navigational hierarchy.
const breadcrumbs = {
  setData : function( data ){
    if( !Array.isArray( data ) || data.length == 0)
      return;
    var $dom = $("breadcrumbs");

    if ($dom == undefined || $dom.length == 0){
      $dom = $("<ol>",{
        id   : "breadcrumbs",
        class: "breadcrumb",
        style:'float:left;height:32px;padding-top:3px; background-color:white',
      });
      $dom.appendTo( $("#toolbar") )
    }
    var param = [];
    if( URL_PARAM.probe_id )
      param.push("probe_id=" + URL_PARAM.probe_id );
    if( URL_PARAM.period )
      param.push("period=" + URL_PARAM.period );
    if( param.length > 0 )
      param = "?" + param.join("&");
    else
      param = "";

    var arr = [ '<li><a href="/chart/'+ page.id + param +'" title="'+ page.title +'"><i class="fa fa-home" aria-hidden="true"></i></a></li>' ];
    data.forEach( function(el){
        arr.push('<li>' + el + '</li>')
    })
    $dom.html(arr.join(""))
  },
  loadDataFromURL : function(){
    var obj = MMTDrop.tools.getURLParameters();
    var arr = [];
    var url = null;
    var title= "";

    for( var key in obj ){
    	//We donot need add period on the bar as we have fPeriod, fProbe
    	//but we need to keep them on url bar
    	if( ! (key == "period" || key == "probe_id" ))
    		continue;

    	var val = obj[key]
    	//first time
    	if (url == undefined ){
    		url = MMTDrop.tools.getCurrentURL([""]) + "?" + key + "=" + val;
    	}else
    		url += "&"+ key + "=" + val;
    }
    
    for( var key in obj ){
      //app_id is used on MUSA probject
      //We donot need add period on the bar as we have fPeriod, fProbe
      if( key == "app_id" || key == "period" || key == "probe_id" )
        continue;
      
      var val = obj[key]
      //first time
      if (url == undefined ){
        url = MMTDrop.tools.getCurrentURL([""]) + "?" + key + "=" + val;
      }else
        url += "&"+ key + "=" + val;

      if( key == "link" ){
    	  title = val.replace(",", " &#x21cb; ");
      }else
    	  title = decodeURIComponent( val );
      
      arr.push( '<a href="'+ url +'" title="'+ key +'='+ val +'">' + title + '</a>' );
    }
    if( arr.length > 0 )
      arr[ arr.length - 1 ] = '<span title="'+ key +'='+ val +'">' + title + '</span>';
    breadcrumbs.setData( arr );
  }
}
