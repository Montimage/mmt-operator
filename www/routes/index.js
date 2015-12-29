var mongo = require('mongodb').MongoClient,
    format = require('util').format;

var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
    var session = req.session;
    if (session.loggedin) {
        res.redirect("/chart");
        return;
    }

    res.render('login', {
        title: 'Login'
    });

});

router.post("/", function (req, res, next) {
    var user = req.body.username;
    var pass = req.body.password;

    mongo.connect(router.dbConnectionString, function (err, db) {
        if (err) throw err;
        db.collection("admin").find({
            username: user
        }).toArray(
            function (err, doc) {
                if (err) throw err;
                
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
                    res.redirect("/chart");
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
    if (req.session.loggedin == undefined) {
        res.redirect("/");
        return;
    }

    res.render('change-password', {
        title: 'Change password',
        username: req.session.loggedin.username
    });
});


router.post("/change-password", function (req, res, next) {
    if (req.session.loggedin == undefined) {
        res.redirect("/");
        return;
    }
    
    var user = req.session.loggedin.username;
    var pass = req.body.password;
    var pass1 = req.body.password1;

    mongo.connect(router.dbConnectionString, function (err, db) {
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
    if (req.session.loggedin == undefined) {
        res.redirect("/");
        return;
    }

    res.render('profile', {
        title: 'Profile',
        clientID: "admin",
        startOn: (new Date()).toDateString(),
        expiredOn: (new Date()).toDateString()
    });
});
module.exports = router;