var spawn = require('child_process').spawn;
var exec  = require('child_process').exec;
var fs    = require('fs');
var os    = require("os");

function Probe( mode ){
    if( mode !== "online" && mode !== "offline")
        throw new Error( 'Mode is either "online" or "offline": ' + mode);

    var mmt_service_name = "probe_" + mode + "_d",
        mmt_license_file = "/opt/mmt/probe/bin/license.key",
        mmt_config_file  = "/opt/mmt/probe/conf/" + mode + ".conf";

    if( os.platform() == "darwin" ){
      mmt_config_file = './test/online.conf'
    }

    var self = this;

    var backup = function( file_name ){
        exec("cp " + file_name + " " + file_name + "_" + (new Date()).getTime() + ".bak" );
    }

    this.get_conf_file_path = function(){
      return mmt_config_file;
    };

    this.get_conf = function( cb ){
      return fs.readFile( mmt_config_file, {
        encoding: 'utf8'
      }, cb );
    };

    this.set_conf = function( data, cb ){
      return fs.writeFile( mmt_config_file, data, cb);
    };

    //get the current input-source
    this.get_input_source = function( cb ){
      fs.readFile( mmt_config_file, {
        encoding: 'utf8'
      }, function (err, content) {
        if (err) return cb(err);
        var arr = content.split('\n');
        //for each line
        for( var i=0; i<arr.length; i++ ){
          var msg = arr[i].split("=");
          //input-source = "eth2" #name of monitoring interfaces
          if( msg[0].trim() == "input-source" ){
            var first  = msg[1].indexOf('"') + 1;
            var second = msg[1].indexOf('"', first);
            //cb( "eth2" )
            cb( msg[1].substring( first, second)  );
            return;
          }
        }
      });
    };

    this.restart = function( callback ){
        return exec("service " + mmt_service_name + " restart", callback);
    };

    this.updateLicense = function( license, callback ){
        backup( mmt_license_file );
        return exec("echo " + license + " > " + mmt_license_file , callback);
        var cmd = "sed -i -e 's/.*/"+ license +"/' " + mmt_license_file;
        return exec(cmd, callback);
    };

    this.updateInputSource = function( value, callback ){
        backup( mmt_config_file );
        fs.readFile( mmt_config_file, {
          encoding: 'utf8'
        }, function (err, content) {
          if (err) return cb(err);
          var arr = content.split('\n');
          //for each line
          for( var i=0; i<arr.length; i++ ){
            var msg = arr[i].split("=");
            //input-source = "eth2" #name of monitoring interfaces
            if( msg[0].trim() == "input-source" ){
              arr[i] = "input-source = " + '"'+ value +'" #changed by mmt-operator ' + (new Date()).toLocaleString() ;
              break;
            }
          }
          fs.writeFile( mmt_config_file, arr.join("\n"), callback );
        });
    };
}

module.exports = Probe;
