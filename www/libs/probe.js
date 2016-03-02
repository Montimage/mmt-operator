var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

function Probe( mode ){
    if( mode !== "online" && mode !== "offline")
        throw new Error( 'Mode is either "online" or "offline": ' + mode);
    
    var mmt_service_name = "run_mmt_" + mode,
        mmt_license_file = "/etc/mmt/License_key.txt",
        mmt_config_file  = "/etc/mmt/mmt_" + mode + ".conf";
    
    var self = this;
    
    var backup = function( file_name ){
        exec("cp " + file_name + " " + file_name + "_" + (new Date()).getTime() );
    }
    
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
        var cmd = "sed -i -e 's/^\\s*input-source.*/input-source = \""+ value +"\"/' " + mmt_config_file;
        return exec(cmd, callback);
    };
}


module.exports = Probe;