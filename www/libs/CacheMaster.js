const cp = require('child_process')
  , path = require("path");

var DataCache = function( mongodb, collection_name_prefix, $key_ids, $inc_ids, $set_ids, $init_ids, retain_period ){
    "use strict";
    const self        = this;
    const SCRIPT_FILE = path.join( __dirname, 'CacheSlaver.js' );
    const ROOT_PATH   = path.join( __dirname, '..' );
    const child       = cp.fork( SCRIPT_FILE, arguments, {cwd : ROOT_PATH} );
    const INIT=1, ADD_MESSAGE = 2, FLUSH_TO_DB = 3, FLUSH_CACHE = 4;
    this.havingMessage = false;

   var option = {
        database: mongodb,
        collection_name: collection_name_prefix,
        message_format:{
            key: $key_ids,
            data: {
                $inc : $inc_ids,
                $set : $set_ids,
                $init: $init_ids,
            }
        }
    }
    this.option = option;

    child.send( [INIT, [mongodb, collection_name_prefix, $key_ids, $inc_ids, $set_ids, $init_ids, retain_period]] );

    this.addMessage = function( msg ){
      self.havingMessage = true;
      child.send( [ADD_MESSAGE,  msg]  );
    };

    this.flushDataToDatabase = function( cb ){
        cb = cb || function(){};

        self.havingMessage = false;
        child.send( [FLUSH_TO_DB], cb );

    };

    this.flushCaches = function( level, cb ){
        cb = cb || function(){};
        child.send( [FLUSH_CACHE, level], cb );
    }
}

module.exports = DataCache;
