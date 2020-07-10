var fs = require('fs');
var _os = require("os");
var path = require('path');

// List all files in a directory in Node.js recursively in a synchronous fashion
var walkSync = function(dir, fn) {
	const files = fs.readdirSync(dir);
	files.forEach(function(file) {
		const p = path.join( dir, file);
		if (fs.statSync( p ).isDirectory())
			walkSync( p, fn);
		else{
			try{
				fn( dir, file );
			}catch( err ){
				console.error("Error while including router", dir, file);
				console.error( err );
			}
		}
	});
};

module.exports = function(app, objRef) {
	//list all files to include into app
	const currentDir = __dirname;
	walkSync( currentDir, function( dir, file ){
		//ignore this file: index.js
		if( dir == currentDir && file == "index.js" )
			return;
		
		//process only .js files
		if( !file.endsWith('.js') )
			return;

		let prefix = path.relative( currentDir, dir );

		//should not occur
		if( prefix.startsWith('.'))
			return;

		prefix = '/auto/' + prefix + '/' + path.parse(file).name;
		console.log(`use router ${prefix} processed by ${file}` );
		const route = require( path.join( dir, file ) );
		route._objRef = objRef;
		app.use( prefix, route )
	})
}