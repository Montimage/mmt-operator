const{ myRemediation, mySize} = require("../reportReader/maintainDB");
const { MongoClient } = require('mongodb');



 const client = new MongoClient("mongodb://localhost:27017" ,{ useNewUrlParser: true, useUnifiedTopology: true });

		
			// Connect to MongoDB
 await client.connect();
const db = client.db("mmt-data");


      

