/**
 * An object represents status of a probe:
 * @typedef {Object} ProbeStatus
 * @property {number} id - identity of probe
 * @property {Array.<ProbeTime>} time: is an array
 * @property {Array} proocolList
 */

 /**
  * Parameters using to get data from MMT-Operator
  * @typedef {Object} ProbeTime
  * @property {BOOL} [isOnline=true] - function mode: online or offline
  * @property {number} startTime - moment of starting
  * @property {number} lastUpdated - last moment the probe updates its status
  */



/**
 * Status of a probe
 * @param {MongoClint} db database
 */
function ProbeStatus( db ){
    const COLLECTION_NAME = "probeStatus";
    var obj    = {};
    var self = this;

    /**
     * Update timestamp of a probe
     * @param  {string}  name       probe name
     * @param  {number}  time       timestamp in milisecond from 1970
     * @param  {Boolean} is_new_run wheter probe restarts
     * @return {Object}             information of the updated probe
     */
    this.upsert = function( name, time, is_new_run ){
        if( obj[ name ] === undefined ){
            length --;
            obj[ name ] = length;
            db.collection( COLLECTION_NAME ).insert({id: length, name: name}, function(err){
                if (err ) console.error( err );
            });
            return length;
        }
        return obj[ name ];
    };

    /**
    * get status of a probe
    *
    */
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

    db.collection( COLLECTION_NAME ).find({}).toArray( function( err, arr ){
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

module.exports = ProbeStatus;
