const net = require("net");
const fs  = require("fs");
/**
 * A Shared memory cache among NodeJS processes.
 * 
 * The data cache is stored and managed by the master process. 
 * The worker sends request to the master and waits for the response if need.
 * The communication between them is done via UNIX socket.
 * 
 */

'use strict';

const OP = {
      GET   : 'get',
      SET   : 'set',
      REMOVE: 'remove',
      CLEAN : 'clean',
}

const UNIX_SOCKET = '/tmp/mmt-operator-shared-memory.sock';   

function callback( cb, data ){
   if( typeof(cb) === 'function' )
      cb( data );
}

/**
 * A simple data cache
 */
class Cache{
   constructor(){
      this.cache = {}; //a hashtable of key-value pairs
   }

   get( key ){
      return this.cache[ key ];
   }

   set( key, data ){
      //console.log(`set ${key} = ${data}`);
      this.cache[ key ] = data;
   }

   remove( key ){
      delete( this.cache[ key ] );
   }
   clean(){
      this.cache = {};
   }
}

/**
 * A quick little thingy that takes a Stream instance and makes
 * it emit 'line' events when a newline is encountered.
 *
 * https://gist.github.com/TooTallNate/1785026
 */
function emitMessages (stream) {
   stream.setEncoding('utf-8');
   
   let backlog = '';
   
   //a separator between message
   const dataSeparator = '\0';
   
   stream.writeMessage = function( msg ){
      let data = JSON.stringify( msg );
      data += dataSeparator;
      stream.write( data, 'utf8' );
   }
   
   stream.on('data', function (data) {
      backlog += data;
      let n = backlog.indexOf( dataSeparator );
      // got a \n? emit one or more 'line' events
      while ( n != -1) {
         let msg = backlog.substring(0, n);
         stream.emit('message', JSON.parse( msg ));
         
         backlog = backlog.substring(n + 1);
         n = backlog.indexOf( dataSeparator );
      }
   });

   stream.on('end', function () {
      if (backlog) {
         stream.emit('line', backlog);
      }
   });
}

class Master extends Cache{
   constructor( maxChildren = 20 ){
      super();
      const self = this;
      
      try{
         fs.unlinkSync( UNIX_SOCKET );
      }catch(e){
         //console.error(e);
      }

      //Create and return a net.Server object, 
      const tcpServer = net.createServer();
      tcpServer.maxConnections = maxChildren;
      //when error
      tcpServer.on('error', console.error);
      
      //when server received a new client
      tcpServer.on('connection', function( client ) {
         console.log( 'New client connected ', client.address() );
         
         emitMessages( client );
         
         //when receiving a message from client
         client.on( 'message', function( msg ){
            try{
               //console.log( msg );
               const operator = msg.operator;
               const key      = msg.key;
               const data     = msg.data;
               switch( operator ){
                  case OP.GET:
                     const newData = self.get( key );
                     msg.data = newData;
                     //send newData back to client
                     client.writeMessage( msg );
                     break;
                  case OP.SET:
                     self.set( key, data );
                     break;
                  case OP.REMOVE:
                     self.remove( key );
                     break;
                  case OP.CLEAN:
                     self.clean();
                     break;
               }
            }catch( e ){
               console.error( e );
            }
         });
      });
      
      tcpServer.listen( UNIX_SOCKET );
      
      //close the server when its process exit
      process.on('exit', function(){
         tcpServer.close();
         tcpServer.distroy();
      });
   }
   
   static isMaster(){
      return true;
   }
}


class Worker{
   constructor(){
      const self = this;
      this.__socket = undefined;
      this.__msgCount = 0;
      this.__callbacks = new Cache();
      
      //close the server when its process exit
      process.on('exit', function(code){
         if( this.__socket ){
            this.__socket.close();
            this.__socket.distroy();
         }
      });
   }
   
   __getSocket( cb ){
      //when socket is existing => return it
      if( this.__socket !== undefined )
         return cb( this.__socket );
      
      //otherwise, create a new one, and initialize it
      const client = new net.Socket();
      client.setKeepAlive( true );
      
      client.on('error', console.error );
      //when receiving a message from server
      client.on('message', function( msg ){
         const id = msg.__id;
         const handler = self.__callback.get( id );
         
         if( id === undefined || handler === undefined ){
            console.warn( 'Receive response with no handler', msg )
            return;
         }
         
         //remove the callback from the list
         self.__callback.remove( id );
         
         handler( msg.data, args );
      });
      
      //connect to server
      client.connect( UNIX_SOCKET, function() {
         emitMessages( client );
         cb( client );
      });
      
      this.__socket = client;
   }

   __sendMessageToMaster( msg, cb, args ){
      this.__getSocket( function(socket){
         
         //when user wants to be called once received response
         //=> we need to add an id to the message to be able to recognize it 
         //    when it is sent back to us in on('message') function
         //=> we need also to remember the callback and its arguments
         if( cb ){
            msg.__id = (self.__msgCount ++);
            self.__callbacks.set( msg.__id, {cb: cb, args: args} );
         }
         
         //send message to server
         socket.writeMessage( msg );
      });
   }

   static isMaster(){
      return false;
   }
   
   get( key, cb ){
      const msg = {
            operator : OP.GET,
            key      : key
      }

      this.__sendMessageToMaster( msg, cb );
   }

   set( key, data ){
      const msg = {
            operator : OP.SET,
            key      : key,
            data     : data
      }
      this.__sendMessageToMaster( msg );
   }

   remove( key ){
      const msg = {
            operator : OP.REMOVE,
            key      : key
      }

      this.__sendMessageToMaster( msg );
   }
   clean(){
      const msg = {
            operator : OP.CLEAN,
            key      : key
      }

      this.__sendMessageToMaster( msg );
   }
   /*
   destroy(){
      if( this.__socket )
         this.__socket.distroy();
   }
   */
}



//Whether we are in the master process or a child one
const isInMasterProcess = ( process.send == undefined )

if( isInMasterProcess )
   module.exports = Master;
else
   module.exports = Worker;