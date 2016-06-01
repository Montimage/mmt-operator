/**
 * return information of systems
 * @param  {[type]} 'express' [description]
 * @return {[type]}           [description]
 */
var express = require('express');
var router  = express.Router();
var _os     = require("os");

function getHardDrive(callback){
    require('child_process').exec('df -k', function(error, stdout, stderr) {

        var total = 0;
        var used = 0;
        var free = 0;

        var lines = stdout.split("\n");

        var str_disk_info = lines[1].replace( /[\s\n\r]+/g,' ');

        var disk_info = str_disk_info.split(' ');

        total = Math.ceil((disk_info[1] * 1024)/ Math.pow(1024,2));
        used = Math.ceil(disk_info[2] * 1024 / Math.pow(1024,2)) ;
        free = Math.ceil(disk_info[3] * 1024 / Math.pow(1024,2)) ;

        callback(total, free, used);
    });
}


router.get('/*', function(req, res, next) {
  var obj = {
    //
    memory:{
      total: _os.totalmem(),
      free : _os.freemem(),
    },
    //load average of 1 minutes
    loadavg : function(){
        var loads = _os.loadavg();
        return loads[0].toFixed(4) ;
    }(),
    //cpu usage, idlee
    cpu : function(){
        var cpus = _os.cpus();
        var user  = 0;
        var nice  = 0;
        var sys   = 0;
        var idle  = 0;
        var irq   = 0;
        var total = 0;

        for(var cpu in cpus){
            user += cpus[cpu].times.user;
            nice += cpus[cpu].times.nice;
            sys  += cpus[cpu].times.sys;
            irq  += cpus[cpu].times.irq;
            idle += cpus[cpu].times.idle;
        }
        var total = user + nice + sys + idle + irq;

        return {
            'idle' : idle,
            'total': total
        };
    }()
  }

  getHardDrive( function( total, free, used ){
    obj.hardDrive = {
      total: total,
      used : used
    };

    res.setHeader("Content-Type", "application/json");
    res.send( obj )
  } );

});

module.exports = router;
