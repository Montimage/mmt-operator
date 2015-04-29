"use strict";
var jsdoc2md = require("jsdoc-to-markdown");
var fs = require("fs");
var dmd = require("dmd");
var util = require("util");
var path = require("path");

var p = {
	src : path.resolve(__dirname, "../../public/lib/mmt/js/mmt_drop.js"),
	json : path.resolve(__dirname, "./source.json"),
	output : path.resolve(__dirname, "../../docAPI/%s.md")
};

try {
	fs.mkdirSync(path.resolve(__dirname, "../../docAPI/"));
} catch (e) {
	//folder exist ==> need to remove old content ???
}

/* we only need to parse the source code once.. cache it */
jsdoc2md({
	src : p.src,
	json : true
}).pipe(fs.createWriteStream(p.json)).on("close", dataReady);


function dataReady() {
	/* parse the jsdoc-parse output.. */
	var data = require(p.json);

	//global definition/typedef
	fs.createReadStream(p.json).pipe(dmd({
		template : "{{>template-typedef}}",
		helper : [ "template/helper/*.js" ],
		partial : [ "template/partial/*.hbs" ]
	})).pipe(fs.createWriteStream(util.format(p.output, "typedef")));

	var home = "MMTDrop ";
	home += "\n\n* [`typedef`](typedef): global data type description";
	
	var lst = {"class" : "", "namespace" : ""};
	
	/* ..because we want an array of class/namespace names */
	var classes = data.reduce(function(prev, curr) {
		if (curr.kind === "class" || curr.kind === "namespace")
			if (curr.name != "MMTDrop"){
				prev.push({
					kind : curr.kind,
					name : curr.name
				});
				
				lst[curr.kind] += "\n    * [`" + curr.name + "`](" + curr.name + ") ";// + curr.description;
			}
		return prev;
	}, []);

	/* render an output	 file for each class */
	renderMarkdown(classes, 0);
	
	
	home += "\n* class\n"     + lst["class"];
	home += "\n\n* namespace\n" + lst["namespace"]; 
	
	fs.createWriteStream(util.format(p.output, "Home")).write( home );
}

function renderMarkdown(classes, index) {
	var className = classes[index].name;
	var kind = classes[index].kind;
	var template = util.format('{{#%s name="%s"}}{{>template-class}}{{/%s}}', kind,
			className, kind);
	console.log(util.format("rendering %s, template: %s", className, template));
	return fs.createReadStream(p.json).pipe(dmd({
		template : template,
		helper : [ "template/helper/*.js" ],
		partial : [ "template/partial/*.hbs" ]
	})).pipe(fs.createWriteStream(util.format(p.output, className))).on(
			"close", function() {
				var next = index + 1;
				if (classes[next]) {
					renderMarkdown(classes, next);
				}else{
					console.log( "\nAPI document is here: " + util.format(p.output, "home") + "\n" );
					fs.unlinkSync(p.json);
				}
			});
}
