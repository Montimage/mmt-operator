var db = require("../libs/backup_db");

describe("BackupDB: Set and Get", function(){
    it("should have the same name", function(){
      db.set_data( {
        $set : {"test": 1}
      }, function( err ){
        assert.ifError( err );
        db.get_data( function( err, data){
          assert.ifError( err );
          assert.equal( data.test, 1 );
        })
      } )
    });
});
