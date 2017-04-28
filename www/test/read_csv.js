var fs         = require('fs');
var path       = require('path');
var lineReader = require('readline');

function read_file ( file_name ) {
    const lr = lineReader.createInterface({
     input: fs.createReadStream( file_name )
    });
    var totalLines = 1;

    var start_ts = (new Date()).getTime();
    console.log("file " + path.basename( file_name ));

    lr.on ('line', function (line) {
        // 'line' contains the current line without the trailing newline character.
    	try{
    		JSON.parse( '[' + line + ']' )
    	}catch( e ){
    		console.error( "Error when processing line " + totalLines + " of file " + file_name );
    		console.error( line );
    		console.error( e );
    	}
        totalLines ++;
    });
};

var args = process.argv.slice(2);
args.forEach(function (val, index, array) {
  read_file( val );
});