**Welcome**

This page briefs about how to modify the MMTDrop library in order to create a new **Database**.


# Architecture

There exist some kinds of databases in MMTDrop, see [User Guide](UserGuide.md).
Developers can create a new kind of filter based on [`MMTDrop.Database`](api/Database.md) class.

# API

An API document of [`MMTDrop.Database`](api/Database.md) is presented [here](api/Database.md).


# Create a new Database

A new filter is created by creating a new instance of [`MMTDrop.Database`](api/Database.md) class.

```javascript
function createStatDB (){
    var param = {
        format : MMTDrop.constants.CsvFormat.STATS_FORMAT,
        period : MMTDrop.constants.preiod.MINUTE,
        probe  : [100],     //get only data captured by probe having id = 100
        source : ['eth0']
    };
    var isAutoLoad = true;
    
    //Create a database that contains maximal the first 10 records
    var db = new MMTDrop.Database(param, 
        function( data){
            var arr = [];
            for( var i=0; i<data.length; i++)
                if( i<10 )
                    arr.push( data[i] );
            return arr;
        },
        isAutoLoad);
        
    console.log( db.data() ) //this will also load data from server as isAutoLoad = true
    
    return db;
}
```
