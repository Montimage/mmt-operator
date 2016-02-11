function AppList( db ){
    var obj = {};
    this.upsert = function( id, name ){
        if( obj[id] != name ){
            obj[id] = name;
            db.collection( "app-list" ).update({_id: 0}, {id: 0, object: obj}, {upsert:true});
        }
    }
    
    this.get = function( id ){
        if( id == null )
            return obj;
        return obj[ id ];
    }
    
    
    db.collection( "app-list").find({_id: 0}).toArray( function( arr ){
        if( arr.length == 1)
            obj = arr[0].object;
    });
}

module.exports = AppList;