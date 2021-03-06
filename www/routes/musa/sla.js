const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const xml2js  = require('xml2js');
const fs      = require("fs");
const HttpException = require("../../libs/HttpException");
const config = require("../../libs/config");
const parser = new xml2js.Parser();

//status of current upload sla
router._data = {};
router._sla  = {};

router.post("/uploadRaw/:id", function(req, res, next) {
   const app_id = (req.params.id == undefined? "__app" : req.params.id);

   const status = router._data[ app_id ] = {progress: 0, message:"", error: false};
   const comp_index = parseInt(req.body.component_index);

   //first component of the app
   if( router._sla[ app_id ]  === undefined  || comp_index == 0)
      router._sla[ app_id ] = {};

   const app_config = router._sla[ app_id ];

   if( app_config.id == undefined )
      app_config.id = app_id;
   if( app_config.init_metrics == undefined )
      app_config.init_metrics    = config.sla.init_metrics; //JSON.parse( req.body.init_metrics );
   if( req.body.init_components !== undefined )
      app_config.init_components = req.body.init_components;

   if( app_config.components == undefined )
      app_config.components = [];

   if( app_config.sla == undefined )
      app_config.sla = {};

   //id of component
   //const comp_index = parseInt(req.body.component_id);

   const slaXml     = req.body.slaXml; 
   //got content of SLA file

   //parse file content as json
   parser.parseString( slaXml, function (err_2, result) {
      if( err_2 ){
         console.error( err_2 );
         //417 Expectation Failed
         // The server cannot meet the requirements of the Expect request-header field
         return res.status(417).end( err_2.message );;
      }

      app_config.sla[ comp_index ] = result;

      //extract content of sla file (that is in JSON format)
      extract_metrics( app_config, comp_index, function( err_3, count, comp_name ){
         if( err_3 ){
            console.error( err_3 );
            res.status(417).end( err_3.message );
            return;
         }

         //202: the request has been accepted for processing, but the processing has not been completed. 
         //     The request might or might not be eventually acted upon, and may be disallowed when processing occurs
         res.status(202).setHeader("Content-Type", "application/json");

         res.send({message: "Got "+ count +" metrics", appId: app_id });

      });

   });//parser.parseString
});

//upload SLA files
router.post("/upload/:id", function(req, res, next) {
   //status of processing SLA files
   const app_id = (req.params.id == undefined ? "__app" : req.params.id );
   const status = router._data[ app_id ] = {progress: 0, message:"", error: false};

   //handle SLA files uploading
   multer({ dest: '/tmp/' }).single("filename")( req, res, function( err ){

      //id of component
      const comp_index = parseInt(req.body.component_id);

      //first component of the app
      if( router._sla[ app_id ]  === undefined || comp_index == 0)
         router._sla[ app_id ] = {};

      const app_config = router._sla[ app_id ];

      if( app_config.id == undefined )
         app_config.id = app_id;
      if( app_config.init_metrics == undefined )
         app_config.init_metrics    = config.sla.init_metrics; //JSON.parse( req.body.init_metrics );
      if( app_config.init_components === undefined )
         app_config.init_components = config.sla.init_components;

      if( app_config.components == undefined )
         app_config.components = [];

      if( app_config.sla == undefined )
         app_config.sla = {};

      if( err ){
         status.progress = 100;
         status.error = true;
         return status.message  = "Error: " + JSON.stringify(err);
      }

      //file being uploaded
      const file  = req.file;

      status.error = false;
      status.progress = 30;
      status.message  = "Uploaded SLA";

      function raise_error( msg ){
         status.progress = 100;
         status.error    = true;
         status.message  = msg;

         console.error( status );
      }

      //waiting for 1 second before parsing SLA file
      //this gives times to show a message above on web browser
      setTimeout( function(){
         if( comp_index >= 5)
            return raise_error( "unsupported");
         //read file's content
         fs.readFile( file.path, {
            encoding: 'utf8'
         }, function (err_1, data) {
            //got content of SLA file
            //==> delete it
            fs.unlink( file.path, function(){} );

            if( err_1 )
               return raise_error( JSON.stringify( err_1) );

            //parse file content as json
            parser.parseString(data, function (err_2, result) {
               if( err_2 ){
                  console.error( err_2 );
                  return raise_error( err_2.message );
               }

               app_config.sla[ comp_index ] = result;

               status.error    = false;
               status.message  = "Parsed SLA";
               status.progress = 40;

               //extract content of sla file (that is in JSON format)
               setTimeout( function(){
                  extract_metrics( app_config, comp_index, function( err_3, count, comp_name ){
                     if( err_3 ){
                        console.error( err_3 );
                        return raise_error( err_3.message );
                     }

                     status.error    = false;
                     status.progress = 100;
                     status.message  = "Extracted "+ count +" metrics ";

                  });

               },2000)
            });//parser.parseString
         });//fs.readFile
      }, 1000);

      //204: The server has successfully fulfilled the request and that there is no additional content to send in the response payload body.
      res.status(204).end()
   })
});

function get_value( obj, arr_atts ){
   if( obj == undefined )
      return obj;

   for( var i=0; i<arr_atts.length; i++ )
      if( obj[ arr_atts[i] ] == undefined )
         return undefined;
      else
         obj = obj[ arr_atts[i] ];
   return obj;
}

//inverse of
const OPERATOR = {
      "eq (=)"  : "!=",
      "ge (>=)" : "<",
      "le (<=)" : ">",
      "eq"  : "!=",
      "ge" : "<",
      "geq": "<=",
      "le" : ">",
      "leq": ">="
}

function get_violation( expr, type ){
   var test = get_value( expr, [0, "oneOpExpression", 0, "$"] );
   if( test != undefined )
      expr = test;
   else{
      expr = get_value( expr, [0, "oneOpExpression", 0] );
   }

   //console.log( JSON.stringify( expr ));

   var opr = get_value( expr, ["operator"]);
   if( opr == undefined )
      op = get_value( expr, ["operator", 0]);
   var val = get_value( expr, ["operand"]);
   if( val == undefined )
      val = get_value( expr, ["operand", 0]);

   if( val == undefined )
      return "";

   if( OPERATOR[opr] != undefined )
      opr = OPERATOR[opr];

   if( type == "string")
      return opr + " \"" + val + "\"";
   return opr + " " + val;
}


function extract_metrics( app_config, index, cb ){
   try{
      var total = 0;

      if( index >= app_config.init_components.length )
         return cb( new Error("Support maximally " + app_config.init_components.length + " components" ) );

      var comp = app_config.init_components[ index ];
      var sla  = app_config.sla[ index ];
      var sla_str = JSON.stringify( sla );

      //remove namespace
      sla_str = sla_str.replace(/[a-zA-Z0-9]+:/g, "");
      sla = JSON.parse( sla_str );

      sla  = get_value(sla, [ "AgreementOffer",  "Terms", 0,  "All", 0] );
      var title = get_value( sla, [ "ServiceDescriptionTerm", 0, "$",  "Name"] );

      console.log("     title = " + title );

      //not based on index but by title
      for( var i=0; i<app_config.init_components.length; i++)
         if( app_config.init_components[i].title == title ){
            comp = app_config.init_components[i];
            console.log( "found " + title );

            //this component is uploaded
            //if( comp.sla != undefined )
            //   return cb( new Error("Component ["+ title +"] was uploaded"));

            break;
         }

      comp.sla = sla_str;

      if( title != undefined && comp.title == undefined ){
         comp.title = title;
      }
      comp.id = parseInt( comp.id );

      //check if existing in app_config.components
      var existed = false;
      for( var i=0; i<app_config.components.length; i++ )
         if( app_config.components[i].id == comp.id ){
            existed = true;
            break;
         }
      if( !existed )
         app_config.components.push( comp );

      var slos = get_value( sla, [ "GuaranteeTerm", 0,  "ServiceLevelObjective", 0,  "CustomServiceLevel", 0, "objectiveList", 0, "SLO"] );
      if( slos == undefined )
         //return cb( {message: "Not found SLO"}, 0, null );
         return cb( null, total, title );

      comp.metrics = [];

      //get data type of each metrics
      const specs = get_value( sla, [ "ServiceDescriptionTerm", 0, "serviceDescription", 0, "security_metrics", 0, "Metric"]);
      if( specs == undefined )
         //return cb( {message: "Not found security metric"}, 0, null );
         return cb( null, total, title );

      const TYPES = {};
      const TITLES = {};
      const DESCRIPTION = {};
      
      for( var j=0; j<specs.length; j++ ){
         let spec = specs[ j ];
         //console.log( JSON.stringify( spec ));
         
         let refID = get_value( spec, ["$", "referenceId"] );
         let name = get_value( spec, ["$", "name"] );
         let type = get_value( spec, ["MetricDefinition", 0, "unit", 0, "enumUnit", 0, "enumItemsType", 0]);
         if( type == undefined )
            type = get_value( spec, ["MetricDefinition", 0, "unit", 0, "intervalUnit", 0, "intervalItemsType", 0]);

         
         TYPES[ name ] = type;

         if( refID  == null || refID.length == 0)
            refID = name ;
         
         TITLES[ refID ] = name;
         
         let description = get_value( spec, ["MetricDefinition", 0, "definition", 0 ] );
         DESCRIPTION[ refID ] = description;
      }




      comp.metric_types = TYPES;
      const DUPLICATE = {};
      for( var j=0; j<slos.length; j++ ){
         const slo = slos[ j ],
             refID = get_value( slo, ["MetricREF", 0] ),
             title = TITLES[ refID ],
             type  = TYPES[ refID ] != null ? TYPES[ refID ] : TYPES[ title ]; //data type
         
         const slo_id = get_value( slo, ["$", "SLO_ID"] );
         const description = DESCRIPTION[ refID ];
         //title   = TYPES[ type ],
          
         let enable  = false,
         support = false
         ;

         if( title == undefined ){
            console.log("Not found title for MetricREF=" + refID );
            continue;
         }
         
         if( DUPLICATE[ title ] != undefined )
            continue;
         
         DUPLICATE[ title ] = title;

         
         /*
         if( title.toLowerCase().indexOf("scan") >= 0  ){
            name = "vuln_scan_freq";
            enable = true;
            support = true;
         }else 
          */
         if(["limit_gtp", "isolation_access"].indexOf( slo_id ) >= 0 ) {
            support = true;
            enable  = true;
         }

         comp.metrics.push({
            id         : comp.id + "." + slo_id,
            title      : title,
            name       : slo_id, 
            description: description,
            priority   : get_value( slo, ["importance_weight", 0]),
            violation  : get_violation( get_value( slo, ["SLOexpression"] ), type ),
            data_type  : type,
            enable     : enable,
            support    : support,
         });

         total ++;
      }
      cb( null, total, title );
   }catch( err ){
      err.message = "SLA format is incorrect: " + err.message;
      cb( err, 0, null );
   }
}

function insert_to_db( app_id, cb ) {
   const app_config = router._sla[ app_id ];

   //reset
   router._sla[ app_id ] = null;

   if( app_config === undefined || app_config.id === undefined )
      return cb( "nothing to update" );

   //upsert to database
   router.dbconnector.mdb.collection("metrics").update( {app_id: app_config.id}, 
         { 
            $set : {
               _id       : app_config.id,
               app_id    : app_config.id,
               init_components: app_config.init_components,
               components: app_config.components,
               metrics   : app_config.init_metrics,
            }
         }, 
         {upsert : true}, cb);
}

function _redirectToMetric( req, res ){
   //reset
   router._data = {};
   router._sla  = {};

   //maintain query string between pages
   var query_string = [];
   //no need probe_id as we want 
   var arr = ["period", "app_id", "period_id"];  

   for (var i in arr) {
      var el = arr[i];
      if (req.query[el] != undefined)
         query_string.push(el + "=" + req.query[el]);
   }

   if (query_string.length > 0)
      query_string = "?" + query_string.join("&");
   else
      query_string = "";

   res.redirect("/chart/sla/metric" + query_string );
}

/**
 * 
 * @param req
 * @param res
 * @param next
 * @returns
 */
router.get("/upload/:id", function( req, res, next ){
   const id     = req.params.id || "__app";
   const status = router._data[ id ];
   const act = req.query.act;

   if( act === "finish" ) {
      return insert_to_db(id, function(err, db){
         if( err )
            console.error( err );
         return _redirectToMetric( req, res );
      });
   }
   else if( act === "cancel" ){
      return _redirectToMetric( req, res );
   }

   if( status === undefined )
      return res.status(400).send("Not found!!!");

   res.setHeader("Content-Type", "application/json");
   res.send( status );
});


module.exports = router;
