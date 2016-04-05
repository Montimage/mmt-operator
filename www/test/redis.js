var redis  = require("redis");
var client = redis.createClient();

client.set("OTT.flow.report",
           '70,2,"eth0",1459525872.000,"/movie_h264/vide",4,12259870,190024,424000,2000,4,4,1');
client.quit();