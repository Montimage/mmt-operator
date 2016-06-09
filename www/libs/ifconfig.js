'use strict';
var _      = require('lodash');
var assert = require('assert');
var cp     = require('child_process');
var fs     = require('fs');
var os     = require("os");
var is_support = (os.platform() == "linux");


var FILE = '/etc/network/interfaces';
if( os.platform() == "darwin" ){
  FILE = './test/interfaces';
  is_support = true;
}

var formatConfig = _.template(function () {
/**
# mmt-operator
auto <%= name %>
iface <%= name %> inet static
  address <%= ip %>
  netmask <%= netmask %>
  gateway <%= gateway %>
  dns-servernames <%= dns_servernames %>
*/
}.toString().split('\n').slice(2, -2).join('\n'));

module.exports = {
    //cb(err, interfaces)
    interfaces: function( cb ){
      if( !is_support )
        return cb( "Do not support this kind of OS", {
            name           : "not support",
            ip             : "not support",
            netmask        : "not support",
            gateway        : "not support",
            dns_servernames: "not support",
          });
      fs.readFile( FILE, {
        encoding: 'utf8'
      }, function (err, content) {
        if (err) return cb(err);

        var arr = _.trim( content ).split('\n');
        var ret = {};
        var iface = null;
        for(var i=0; i<arr.length; i++){
          var msg = _.trim( arr[i] ).split(' ');

          //auto eth0
          if(  msg[ 0 ] == "auto" )
            continue;
          if( msg[0] == "" || msg[0].indexOf("#") == 0 )
            continue;
          //iface eth0 inet static
          if( msg[ 0 ] == "iface" ){
            iface        = msg[ 1 ];
            ret[ iface ] = {};
            continue;
          }

          //properties: address, netmask, ...
          if( iface )
            ret[ iface ][ msg[0] ] = msg.slice(1).join(" ");
        }

        cb(null, ret);
      });//end fs.readFile
    },
    /**
     * Configure a network interface
     * @param  {string}   name        interface name
     * @param  {object}   description interface description
     * @param  {Function} cb          cb( error )
     */
    configure: function( name, description, cb ){
      if( !is_support )
        return cb("Do not support this kind of OS" );

      assert(_.isString(name));
      assert(_.isPlainObject(description));

      fs.readFile( FILE, {
        encoding: 'utf8'
      }, function (err, content) {
        if (err) return cb(err);

        function replaceInterface(name, content, interfaceDescription) {
          return excludeInterface(name, content).trim() + '\n\n' + formatConfig(_.extend({
            name: name
          }, interfaceDescription)) + '\n';
        }


        function excludeInterface(name, content) {
          var without = _.curry(function (name, content) {
            return !_.includes(content, name);
          });

          return _.chain(content)
            .split('\n\n')
            .filter(without(name))
            .join('\n\n').trim();
        }


        fs.writeFile( FILE, replaceInterface(name, content, description), function (err) {
          if (err)  return cb(err);

          //restart network
          cp.exec('ifdown ' + name + "; ifup " + name, function (err, __, stderr) {
            cb(err || stderr || null);
          });
        });//end fs.writeFile
      });//end fs.readFile
    }
};
