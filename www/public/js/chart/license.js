var license = {};
license.db = MMTDrop.databaseFactory.createStatDB({id:"chart.license"});
license.reload = function(){
    license.db.reload();
    var msg = license.db.data();
    
};


var $alert = $("<div>", {
    id   : "alert",
    class: "alert alert-danger alert-dismissible",
    role : "alert"
}).append($("<button>", {
    class: "close",
    type : "button",
    "data-dismiss" : "alert", 
    "aria-label" : "Close",
    "html": '<span aria-hidden="true">&times;</span>'
})).append($("<strong>", {
    html: "text"
}));

$alert.insertBefore( $("#content"));
