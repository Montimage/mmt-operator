const child_process   = require("child_process");
const fs              = require('fs');


function childProcess( file, params, env, autoRestart ){
   const self = {};
   
   if( autoRestart == undefined )
      autoRestart = 0;
   
   self.file   = file;
   self.params = params;
   self.env    = env;
   self.autoRestart = autoRestart;
   self.childProcess = null;
   
   //callbacks are called when exit or restart
   self.onExit = null;
   self.onRestart = null;
   
   self.start = function(){
      self.childProcess = child_process.fork( self.file, self.params, self.env );
      self.childProcess.on("exit", self.restart );
      return self;
   }
   
   self.restart = function(){
      //exec only one time left
      if( self.autoRestart == 1 ){
         if( typeof( self.onExit ) == "function" )
            self.onExit( self );
         return;
      }
      
      //reduce timelife
      if( self.autoRestart > 0 )
         self.autoRestart --;
      
      //callback if need
      if( typeof( self.onRestart ) == "function" )
         self.onRestart( self );
      
      //restart the process: start a new process
      return self.start();
   }
   

   self.kill = function(){
      self.childProcess.kill( 'SIGKILL' );
      self.childProcess = null;
      return self;
   }
   
   self.stop = function(){
      self.childProcess.kill( 'SIGINT' );
      self.childProcess = null;
      return self;
   }
   return self;
}

module.exports = childProcess;