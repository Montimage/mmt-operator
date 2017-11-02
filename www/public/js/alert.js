var socket = {};
if( typeof io != "undefined" )
   socket = io();
else{
   console.warn("Cannot find socketio");
   socket.on = console.log;
}

socket.on('log', function(msg){
    if( msg.type == undefined )
        msg.type = "success"; //"error"
    if( msg.delay == undefined )
        msg.delay = 20000;
    if( msg.html == undefined )
        msg.html = "!";
    
    alertify.log(msg.html, msg.type, msg.delay);
});
