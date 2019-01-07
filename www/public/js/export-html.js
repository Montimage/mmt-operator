
function correctGrid(){
   
   $("body").css("width", $("body").width() );
   $(".grid-stack-item").each( function(){
      const $item = $(this);

      //clearly indicate these attribute in inline style
      ["top", "height", "width", "min-width"].forEach( key => $item.css( key, $item.css(key) ) );
      //$item.css( "width", (($item.width() / $item.parent().width) * 100) + '/%');
   });
}

//Get binary file using XMLHttpRequest
function getBinary( file, charset ) {
   if( !charset)
      charset = "x-user-defined";
   const xhr = new XMLHttpRequest();
   xhr.open("GET", file, false);
   xhr.overrideMimeType("text/plain; charset=" + charset);
   xhr.send( null );

   if( xhr.status !== 200 )
      return;

   return {
      data: xhr.responseText,
      mimeType: xhr.getResponseHeader("content-type") || ""
   };
}

//Base64 encode binary string
//Stolen from http://stackoverflow.com/questions/7370943/retrieving-binary-file-content-using-javascript-base64-encode-it-and-reverse-de
function base64Encode(str) {
   const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
   var out = "", i = 0, len = str.length, c1, c2, c3;
   while (i < len) {
      c1 = str.charCodeAt(i++) & 0xff;
      if (i == len) {
         out += CHARS.charAt(c1 >> 2);
         out += CHARS.charAt((c1 & 0x3) << 4);
         out += "==";
         break;
      }
      c2 = str.charCodeAt(i++);
      if (i == len) {
         out += CHARS.charAt(c1 >> 2);
         out += CHARS.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
         out += CHARS.charAt((c2 & 0xF) << 2);
         out += "=";
         break;
      }
      c3 = str.charCodeAt(i++);
      out += CHARS.charAt(c1 >> 2);
      out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
      out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
      out += CHARS.charAt(c3 & 0x3F);
   }
   return out;
}


function plainCssLinks(){
   $("link").each( function( index ){
      const excludeLinks = [""];
      const $item = $(this);
      const href  = $item.attr("href");
      //remove this link
      $item.remove();

      $("head").append('<style type="text/css" data-href="'+ href +'" id="style-' + index +'"></style>');

      const cssHref = new URL( href, window.location.href );

      //get content
      const res = getBinary( cssHref, "utf-8" );
      if( ! res )
         return;

      console.log( "Got CSS " + href );
      
      let cssData = res.data;

      //get url content, then, embedde it into base64 
      const regex = /url\((?!['"]?(?:data|http):)['"]?([^'"\)]*)['"]?\)/g;
      do {
         const m = regex.exec( cssData );
         if( !m )
            break;

         const url = m[1];

         if( url.indexOf("font") === -1 )
            continue;

         const fileUrl = new URL( url, cssHref).href;

         const res = getBinary( fileUrl );

         if( res == undefined )
            continue;

         console.log( "=> got url " + url );
         
         //const base64 = getBase64( data );
         const base64 = "data:"+ res.mimeType +";base64," + base64Encode( res.data);
         cssData = cssData.replace( url, base64 );

      }while( true );

      $("#style-"+index).html( cssData );
   });
}



function plainJavascriptLinks(){
   $("script").each( function( index ){
      //list of scripts to be excluded
      const excludeLinks = [ "/js/export-html.js", 
         "/js/chart/common.js", 
         "/js/chart/pre-common.js", 
         "/socket.io/socket.io.js"];
      const $item = $(this);
      const href  = $item.attr("src");

      //no link
      if( href == undefined )
         return;

      if( excludeLinks.indexOf( href ) !== -1 ){
         //remove the script
         $item.remove();
         return;
      }

      //remove this link
      $item.removeAttr("src");
      $item.attr("data-src", href); 

      //get content
      const res = getBinary( href, "utf-8" );
      if( !res )
         return;
      
      console.log("Got script " + href );
      $item.text( res.data );
   });
}


function embeddeImgs(){
   $("img").each( function( index ){
      //list of scripts to be excluded
      const excludeLinks = [];
      const $item = $(this);
      const href  = $item.attr("src");

      //no link
      if( href == undefined )
         return;

      if( excludeLinks.indexOf( href ) !== -1 ){
         //remove the script
         $item.remove();
         return;
      }

      //get content
      const res = getBinary( href );
      if( !res )
         return;
      
      const base64 = "data:"+ res.mimeType +";base64," + base64Encode( res.data);
      //replace src link by base64 data
      $item.attr("src", base64 );
   });
}


function getPlainHtml(){
   $("head").prepend('<meta charset="utf-8">');
   correctGrid();
   plainCssLinks();
   plainJavascriptLinks();
   embeddeImgs();
}