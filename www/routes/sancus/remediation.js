var express  = require('express');
var router   = express.Router();
const config = require("../../libs/config");
const SSHClient = require("../../libs/client_ssh.js");




const connSettings = {
  host: config.master_node.host,//ip master node
  port: config.master_node.port, // Default SSH port
  username: config.master_node.username,
  password: config.master_node.password // Or you can use key-based authentication
};



router.post("",async function(req, res) {
  console.log("Received "+req.query.CID+" "+ req.query.IP );
  var scriptCode = `kubectl exec amf-45-ipds-0 -n ath-cmm-45 -- bash -c "nft insert rule ip filter INPUT ip daddr `+ req.query.IP +` drop"`;

  //produceMessage();
  //_publishMessage( "testTopic", "ciao" )
  //var result=await produceMessage(req.query.CID);
  const ssh = new SSHClient();
  try{
    ssh.connect(connSettings).then( () =>{
    ssh.executeCommand ( scriptCode ) .then(() => {
      console.log('Command kubectl executed successfully');
      res.status(204).end()//204: The server has successfully fulfilled the request and that there is no additional content to send in the response payload body.
      ssh.disconnect();

      } )
    .catch((err) => {
    
        console.error('Command execution failed');
        res.status(500).send( "Error: Script not execute on Nokia firewall" );
        ssh.disconnect();

      });
  });

  }catch(err){
    console.error(err);

  }
 
});


module.exports = router;











