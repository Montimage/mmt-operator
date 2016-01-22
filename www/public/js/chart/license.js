var license = {};
license.db = MMTDrop.databaseFactory.createStatDB({id:"chart.license"});
license.reload = function(){
    license.db.reload();
    var msg = license.db.data();
    
};
