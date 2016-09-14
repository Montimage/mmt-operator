function AppList( db ){
    var obj    = {}; //appname ==> app_id
    var length = -1;
    this.upsert = function( name ){
        if( obj[ name ] === undefined ){
            length --;
            obj[ name ] = length;
            db.collection( "app_list" ).insert({id: length, name: name}, function(err){
                if (err ) console.error( err );
            });
            
            return length;
        }
        
        return obj[ name ];
        
    };
    
    this.get = function( name ){
        //get all;
        if( name == null ){
            var ret = {};
            for( var i in obj )
                ret[ obj[i] ] = i;
            return ret;
        }
        return obj[ name ];
    };
    
    this.clear = function(){
        obj    = {};
        length = -1;
    };
    
    db.collection( "app_list").find({}).toArray( function( err, arr ){
        if( err ){
            console.error( err );
            return;
        }
        for( var i in arr ){
            length             = arr[i].id ;
            obj[ arr[i].name ] = length;
        }
    });
}

module.exports = AppList;
