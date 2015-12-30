/**
 * A cache retains data in a period.
 * @param {integer} MAX_PERIOD period size of this cache by seconds
 * @param {integer} MAX_LENGTH size of this cache
 */
var Window = function ( MAX_PERIOD, MAX_LENGTH, name ){
    if( name === undefined )
        name = "";
    
    MAX_PERIOD *= 1000;
    var self = this;
    this.name = name;
    this.config = {
        MAX_PERIOD : MAX_PERIOD,
        MAX_LENGTH : MAX_LENGTH
    }
    this.latestTimestamp = 0;
    this.oldestTimestamp = 0;
    
    this.data            = [];
    
    this.pushArray = function( arr ){
        if( arr === undefined )
            arr = []; 
        console.log( "WINDOW " + name + ": load " + arr.length + " records to RAM"  );
        for( var i=0; i<arr.length; i++ )
            self.push( arr[i] );
    }
    
    //msg.time is in miliseconds;
    this.push = function( message ){
        if( message === undefined )
            return;
        
        var msg = message.slice(); //clone data
        msg.isFreshData = true;
        var time = msg[3];
        
        if( self.oldestTimestamp === 0 )
            self.oldestTimestamp = time;
        
        if( time >= self.latestTimestamp){
            self.latestTimestamp = time;
            self.data.push( msg );
        }else if( time < self.oldestTimestamp ){
            //add only if we have places
            if( self.data.length < MAX_LENGTH && self.latestTimestamp - time < MAX_PERIOD ){
                self.oldestTimestamp = time;
                self.data.unshift( msg );
                return;
            }
        }else {
            var i=0; 
            //find a true place to put the message
            for( ; i<self.data.length; i++)
               if( self.data[i][3] > time )
                   break;
            //add the message just before i
            self.data.splice(i-1, 0, msg );
        }
        
        //
        var numberOfRemoved = 0;
        while ( self.latestTimestamp - self.oldestTimestamp > MAX_PERIOD 
                 || self.data.length > MAX_LENGTH ) {
            
            if( numberOfRemoved >= self.data.length - 1 )
                break;
            
            
            numberOfRemoved ++;
            
            self.oldestTimestamp = self.data[ numberOfRemoved - 1 ][ 3 ];
        }
        //remove the first (index+1) elements
        
        if( numberOfRemoved > 0 ){
            console.log( "WINDOW " + name + ": removed " +  numberOfRemoved + "/" + self.data.length + " records");
            self.data.splice(0, numberOfRemoved);
        }
    };
    
    /**
     * Get all data, and mark them as being proceessed
     * @returns {Array} [[Description]]
     */
    this.getAllData = function( formats, start_time ){
        var arr = [];
        if( self.data.length == 0 )
            return arr; 
        if( start_time === undefined )
            start_time = 0;
        
        if( formats instanceof Array )
            for( var i=0; i<self.data.length; i++ ){
                var msg = self.data[i];
                if( formats.indexOf( msg[0] ) == -1 )
                    continue;
                
                if( msg[3] < start_time )
                    continue;

                if( msg.isFreshData === true)
                    delete( msg.isFreshData );
                
                arr.push( msg );
            }
        
        return arr;
    }
    
    
    /**
     * Get all fresh data
     */
    this.getFreshData = function( formats ){
        var arr = [];
        if( self.data.length == 0 )
            return arr; 
        
        if( formats instanceof Array )
            for( var i in self.data ){
                var msg = self.data[i];
                if( formats.indexOf( msg[0] ) == -1 )
                    continue;

                if( msg.isFreshData === true){
                    delete( msg.isFreshData );
                    arr.push( msg );
                }
            }
        return arr;
    }
}


module.exports = Window;