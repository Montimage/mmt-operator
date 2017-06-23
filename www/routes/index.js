var format        = require('util').format,
    dataAdaptor   = require('../libs/dataAdaptor'),
    HttpException = require('../libs/HttpException'),
    AdminDB       = require("../libs/AdminDB");

var express = require('express');
var router  = express.Router();

router.mdb = null;
var connect_to_db = function( cb ){
    if( router.mdb != null ){
        cb( null, router.mdb );
        return;
    }
    var admin_db = new AdminDB();
    admin_db.connect(function (err, db){
       if(!err)
           router.mdb = db;
        cb( err, db );
    });
};

var is_loggedin = function( req, res, redirect_url){
    //return true;
    if (req.session.loggedin == undefined) {
        if( redirect_url != undefined )
            res.redirect( redirect_url );
        else
            res.redirect( "/" );

        return false;
    }
    return true;
};

router.all("/info/*", function( req, res, next ){
  if ( req.session.loggedin == undefined) {
	  res.status(403).send("Permision Denided");
	  return;
	}

  next();
});

/* GET home page. */
router.get('/', function (req, res, next) {
    var session = req.session;
    if (session.loggedin) {
        var url = "/chart";
        if( req.cookies.current_url )
            url = req.cookies.current_url;
        res.redirect( url );
        return;
    }

    res.render('login', {
        title: 'Login'
    });

});

router.post("/", function (req, res, next) {
    var user = req.body.username;
    var pass = req.body.password;

    connect_to_db(function (err, db) {
        if (err) throw new HttpException(req, res, err);
        db.collection("admin").find({
            username: user
        }).toArray(
            function (err, doc) {
                if (err) throw new HttpException(req, res, err);;

                var loginOK = false;

                //not found username
                if (Array.isArray(doc) && doc.length === 0 ) {
                    //verify the default user+pass
                    if( user === "admin" && pass === "mmt2nm" ){
                        loginOK = true;

                        //initilize database
                        db.collection("admin").insert({
                            username: user,
                            password: pass
                        }, function (err, result) {
                            //if (err) throw err;
                            console.log("Initilized username:" + user);
                        });
                    }
                } else{
                    loginOK = (doc[0].password === pass);
                }

                if ( loginOK ) {
                    req.session.loggedin = {
                        username: user
                    }
                    res.redirect("/");
                    return;
                }

                res.render('login', {
                    title: 'Login',
                    message: 'Username or password is not correct!'
                });
            }
        );
    });
});


router.get("/logout", function (req, res, next) {
    req.session.destroy();

    res.render('login', {
        title: 'Logout',
        message: 'You have been successfully logged out!'
    });
});


router.get("/change-password", function (req, res, next) {
    if( !is_loggedin(req, res) ) return;

    res.render('change-password', {
        title: 'Change password',
        username: req.session.loggedin.username
    });
});


router.post("/change-password", function (req, res, next) {
    if( !is_loggedin(req, res) ) return;

    var user = req.session.loggedin.username;
    var pass = req.body.password;
    var pass1 = req.body.password1;

    connect_to_db(function (err, db) {
        if (err) throw err;
        db.collection("admin").find({
            username: user
        }).toArray(
            function (err, doc) {
                if (err) throw err;

                var message = "";
                //not found username
                if (doc.lenght == 0)
                    message = "Not found username [" + user + "]";
                else {
                    var p = doc[0].password;

                    if (pass == p)
                        db.collection("admin").update({
                            username: user
                        }, {
                            $set: {
                                password: pass1
                            }
                        }, function (err, result) {
                            if (err) throw err;
                            message = "The new password has been successfully updated!";
                            res.render('change-password', {
                                title: 'Change-password',
                                username: user,
                                message: message
                            });
                            return;
                        });
                    else
                        message = "The current passowrd is not correct!";
                }
                if (message != "")
                    res.render('change-password', {
                        title: 'Change-password',
                        username: user,
                        message: message
                    });

            }
        );

    });
});


router.get("/profile", function (req, res, next) {
    if( !is_loggedin(req, res) ) return;

    router.dbadmin.getLicense( function( err, msg){
        var version = "";
        
        if( msg == undefined ){ 
            msg = {};
            version = "No License";
        }
        else
            version = "MMT-Operator: " + router.config.version 
                  + "\nMMT-Probe   : " + msg[ dataAdaptor.LicenseColumnId.VERSION_PROBE] 
                  + "\nMMT-SDK     : " + msg[ dataAdaptor.LicenseColumnId.VERSION_SDK]
        
        
        res.render('profile', {
            title     : 'Profile',
            version   : version,
            //version   : " MMT-Operator 1.6.5-5dc7f4f,\n MMT-Probe 1.2.1-b5876c7,\n MMT-Security 1.1.4-8c20261,\n MMT-DPI 1.6.8.1-47e533f",
            deviceID  : msg[ dataAdaptor.LicenseColumnId.MAC_ADDRESSES ],
            expiredOn : (new Date(msg[ dataAdaptor.LicenseColumnId.EXPIRY_DATE ])).toString(),
        });
    } );

});
router.post("/profile", function (req, res, next) {
    if( !is_loggedin(req, res) ) return;

    var license = req.body.serialKey;
    if( license )
        router.probe.updateLicense( license, function( error, stdout, stderr ){
            console.log( stdout );
            console.log( stderr );
            if (error !== null) {
              console.log( error );
            }
        } );

    router.dbadmin.getLicense( function( err, msg){
        if( err ) throw new HttpException(req, res, err);

        res.render('profile', {
            title     : 'Profile',
            clientID  : "admin",
            deviceID  : msg[ dataAdaptor.LicenseColumnId.MAC_ADDRESSES ],
            expiredOn : (new Date(msg[ dataAdaptor.LicenseColumnId.EXPIRY_DATE ])).toString(),
            message   : "License was updated!"
        });
    } );
});


router.get("/setting", function (req, res, next) {
    if( !is_loggedin(req, res) ) return;

    //maintain query string between pages
    var query_string = []; 
    var arr = ["period", "probe_id", "app_id", "period_id", "alert", "violation"];
    for (var i in arr) {
        var el = arr[i];
        if (req.query[el] != undefined)
            query_string.push(el + "=" + req.query[el]);
    }   

    if (query_string.length > 0)
        query_string = "?" + query_string.join("&");
    else
        query_string = ""; 

    res.render('setting', {
        title: 'Setting',
        query_string: query_string
    });
});

router.post("/setting", function (req, res, next) {
    if( !is_loggedin(req, res) ) return;

    var action = req.body.action;
    if( action == "empty_database" ){
        router.dbconnector.emptyDatabase(
            function(){
                    res.redirect("/");
            }
        );
        return;
    }
    res.redirect("/");
});

module.exports = router;
