const router = {};
var config   = require("../libs/config.js");
var jwt      = require('jsonwebtoken');


//check login using token
function _getTokenFromHeaderOrQuerystring (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    }
    return null;
}

function _decodeToken( token, key ){
    try {
        const decoded = jwt.verify(token, key);
        return decoded;
    } catch(err) {
    // err
    }
}

const credentials = config.auth_token;
if( !credentials )
    console.log('No auth_token is provided');
if( !Array.isArray( credentials) )
    console.log( 'config.auth_token must be an array');
    
router.decodeToken = function(req){
    const token = _getTokenFromHeaderOrQuerystring(req);
    
    if( token === undefined  || !Array.isArray( credentials))
        return false;
    
    for( let i=0; i<credentials.length; i++ ){
        const cred = credentials[i];
        if( cred.enable == false )
            continue;
        const key = cred.credentialText;
        const decoded = _decodeToken( token, key );
        if( !decoded )
            continue;
            
        return decoded;
    }
};

router.isLogin = function( req ){
    //return true;
    if (req.session.loggedin == undefined) {
        //try to verify using token
        const decoded = router.decodeToken( req );
        console.log(decoded);
        if( decoded ){
            req.session.loggedin = decoded;
            return true;
        }
        return false;
    }
    return true;
};

router.checkLogin = function( req, res, redirect_url=null ){
    if( router.isLogin( req ))
        return true;
    else{
        if( redirect_url != undefined )
            res.redirect( redirect_url );
        else
            res.redirect( "/" );
        return false;
    }
};
/*
router.all("*", function( req, res, next){
    //const token = getTokenFromHeaderOrQuerystring( req );
    //console.log( "token", token );
    next();
});
*/
module.exports = router;