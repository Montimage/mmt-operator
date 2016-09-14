const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const xml2js  = require('xml2js');
const fs      = require("fs");

const HttpException = require("../../libs/HttpException");

const parser = new xml2js.Parser();

//status of current upload sla
router._data = {};
router._sla  = {};
//upload SLA files
router.post("/upload/:id", function(req, res, next) {
  //status of processing SLA files
  var app_id = req.params.id;
  if( app_id == undefined ) app_id = "_undefined";
  if( router._sla[ app_id ]  === undefined )
    router._sla[ app_id ] = {};

  const status = router._data[ app_id ] = {progress: 0, message:""};

  const app_config = router._sla[ app_id ];

  //handle SLA files uploading
  multer({ dest: '/tmp/' }).single("filename")( req, res, function( err ){
    if( err ){
      status.progress = 100;
      status.error = true;
      return status.message  = "Error while uploading SLA files: " + err.message;
    }

    const file  = req.file;
    if( app_config.id == undefined )
      app_config.id = app_id;
    if( app_config.init_metrics == undefined )
      app_config.init_metrics    = JSON.parse( req.body.init_metrics );
    if( app_config.init_components === undefined )
      app_config.init_components = JSON.parse( req.body.init_components );
    if( app_config.sla == undefined )
      app_config.sla = {};

    const comp_index = parseInt(req.body.component_id);

    status.error = false;
    status.progress = 30;
    status.message  = "Uploaded SLA";

    function raise_error( msg ){
      status.progress = 100;
      status.error    = true;
      status.message  = msg;
    }
    //waiting for 1 second before parsing SLA file
    //this gives times to show a message above on web browser
    setTimeout( function(){
      if( comp_index >= 3)
        return raise_error( "unsupported");
      //read file's content
      fs.readFile( file.path, {
        encoding: 'utf8'
      }, function (err, data) {
        //got content of SLA file
        //==> delete it
        //fs.unlink( file.path );

        if( err )
          return raise_error( err );

        //parse file content as json
        parser.parseString(data, function (err, result) {
          if( err )
            return raise_error( "Error while parsing file " + file.originalname + ": " + err );

          app_config.sla[ comp_index ] = result;

          status.message  = "Parsed SLA";
          status.progress = 40;

          setTimeout( function(){
            extract_metrics( app_config, comp_index, function( err, count, comp_name ){
              if( err )
                return raise_error( err.message );

              status.progress = 100;
              status.message  = "Extracted "+ count +" metrics ";

            });

        },2000)
        });//parser.parseString
      });//fs.readFile
    }, 1000);

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
}

function get_violation( expr, type ){
  expr = get_value( expr, [0, "specs:oneOpExpression", 0, "$"] );

  var opr = get_value( expr, ["operator"]);
  var val = get_value( expr, ["operand"]);

  if( type == "string")
    return OPERATOR[opr] + " \"" + val + "\"";
  return OPERATOR[opr] + " " + val;
}

function extract_metrics( app_config, index, cb ){
  var total = 0;

    var comp = app_config.init_components[ index ];
    var sla  = app_config.sla[ index ];
    comp.sla = JSON.stringify( sla );

    sla = get_value(sla, ["wsag:AgreementOffer", "wsag:Terms", 0, "wsag:All", 0] );

    var title = get_value( sla, ["wsag:ServiceDescriptionTerm", 0, "$", "wsag:Name"] );
    if( title != undefined )
      comp.title = title;
    comp.id = parseInt( comp.id );

    var slos = get_value( sla, ["wsag:GuaranteeTerm", 0, "wsag:ServiceLevelObjective", 0, "wsag:CustomServiceLevel", 0, "specs:objectiveList", 0, "specs:SLO"] );
    comp.metrics = [];

    //get data type of each metrics
    const specs = get_value( sla, ["wsag:ServiceDescriptionTerm", 0, "specs:serviceDescription", 0, "specs:security_metrics", 0, "specs:Metric"]);
    const TYPES = {};
    for( var j=0; j<specs.length; j++ ){
      var spec = specs[ j ];
      var type = get_value( spec, ["specs:MetricDefinition", 0, "specs:unit", 0, "specs:enumUnit", 0, "specs:enumItemsType", 0]);
      if( type == undefined )
        type = get_value( spec, ["specs:MetricDefinition", 0, "specs:unit", 0, "specs:intervalUnit", 0, "specs:intervalItemsType", 0]);
      TYPES[ get_value( spec, ["$", "name"] ) ] = type;
    }

    comp.metric_types = TYPES;

    for( var j=0; j<slos.length; j++ ){
      var slo = slos[ j ],
        title = get_value( slo, ["specs:MetricREF", 0] );
        type  = TYPES[ title ]
      ;
      comp.metrics.push({
        id       : comp.id * 1000 + get_value( slo, ["$", "SLO_ID"] ),
        title    : title,
        name     : comp.id * 1000 + get_value( slo, ["$", "SLO_ID"] ),
        priority : get_value( slo, ["specs:importance_weight", 0]),
        violation: get_violation( get_value( slo, ["specs:SLOexpression"] ), type ),
        data_type: type,
        enable   : false,
        support  : false,
      });

      total ++;
    }
  cb( null, total, title );
}

function insert_to_db( app_id, cb ) {
  const app_config = router._sla[ app_id ];
  if( app_config === undefined || app_config.id === undefined )
    return cb( "nothing to update" );

  //upsert to database
  router.dbconnector.mdb.collection("metrics").update( {app_id: app_config.id}, {
    _id       : app_config.id,
    app_id    : app_config.id,
    components: app_config.init_components,
    metrics   : app_config.init_metrics,
  }, {upsert : true}, cb);
}

router.get("/upload/:id", function( req, res, next ){
  const id     = req.params.id || "_undefined";
  const status = router._data[ id ];

  const act = req.query.act;

  if( act === "finish" ) {
    return insert_to_db(id, function(){
      res.redirect("/chart/sla/metric");
    });
  }
  else if( act === "cancel" ){
    return res.redirect("/chart/sla/metric");
  }

  if( status === undefined )
    return res.status(400).send("Not found");

  res.setHeader("Content-Type", "application/json");
  res.send( status );
});

module.exports = router;
