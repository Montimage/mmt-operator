var waiting = {
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
var breadcrumbs = {
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
    var arr = [ '<li><a href="/chart/'+ page.id +'" title="'+ page.title +'"><i class="fa fa-home" aria-hidden="true"></i></a></li>' ];
    data.forEach( function(el){
        arr.push('<li>' + el + '</li>')
    })
    $dom.html(arr.join(""))
  },
  loadDataFromURL : function(){
    var obj = MMTDrop.tools.getURLParameters();
    var arr = [];
    var url = null;
    var last= "";
    for( var key in obj ){
      if (url == undefined )
        url = MMTDrop.tools.getCurrentURL([key]);
      else
        url += "&"+ key + "=" + obj[key];
      arr.push( '<a href="'+ url +'" title="'+ key +'='+ obj[key] +'">' + obj[key] + '</a>' );
      last = obj[key];
    }
    if( arr.length > 0 )
      arr[ arr.length - 1 ] = last;
    breadcrumbs.setData( arr );
  }
}
