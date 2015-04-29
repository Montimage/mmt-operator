"use strict";
var util = require("util");

exports.gotoTypedef   = gotoTypedef;
exports.generatedDate = generatedDate;
exports.formatAnchor   = function( str ){
	if( str )
		str = str.toLowerCase().replace(/\./g, "");
	return str;
};

/**
replaces {code} tags with markdown links in the suppied input text
*/
exports.formatDescription = function(text){
    if (text){
    	text = text.replace(/\&lt;/g, '<').replace(/&gt;/g, '>');
    	//change code
        text = text.replace(/\<code\>/g,   '`' );
        text = text.replace(/\<\/code\>/g, '`' );
        
        //remove break line
        text = text.replace(/\<br\/\>/g,   '' );
        text = text.replace(/\<br\>/g,     '' );
        
        //reformat local link
        //goto a method inside class
        //[MMTDrop.tools#mergeObjects](MMTDrop.tools#mergeObjects)
        //MMTDrop.reportFactory.createRealtimeReport ==> reportFactory#createRealtimeReport
		text = text.replace(/\]\(\#?MMTDrop\.(\w+)[\.\#](.+)\)/g, function(match, p1, p2){
			return '](' + p1 + '#markdown-header-' + p2.toLowerCase() + ')';
		});
		
		//goto a class
		text = text.replace(/\#MMTDrop\./g, '');
		
		//else start with # ==> goto typedef#
		text = text.replace(/\]\(\#(\w+)/g, function(match, p1){
			return '](typedef#markdown-header-' + p1.toLowerCase();
		});
    }
    return text;
};


function gotoTypedef( url ){
	
	//start with #MMTDrop. ==> goto class
	if( url.indexOf("#MMTDrop.") == 0 || url.indexOf("MMTDrop.") == 0){
		//goto a method inside class
		//MMTDrop.reportFactory.createRealtimeReport ==> reportFactory#createRealtimeReport
		url = url.replace(/\#?MMTDrop\.(\w+)[\.\#](.+)/g, function( match, p1, p2){
			return p1 + "#markdown-header-" + p2.toLowerCase();
		});
		
		//go to class
		url = url.replace(/\#MMTDrop\./g, '');
		return url;
	}
	
	//else start with # ==> goto typedef#
	url = url.toLowerCase().replace(/\#/, 'typedef#markdown-header-');
	return url;
}

function generatedDate(){
    return new Date().toUTCString();
};