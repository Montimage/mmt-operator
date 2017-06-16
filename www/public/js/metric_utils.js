function getQuery( collection, col_id, el, status_db){

  if (el.dataset){
    var obj  = el.dataset;
  }else{
    // comes from charts: i.e availability.js
    var obj  = el;
  }

  var expr = obj.value;

  expr = expr
      .replace(">=", '"$gte":').replace(">", '"$gt" :')
      .replace("<=", '"$lte":').replace("<", '"$lt" :')
      .replace("!=", '"$ne":')
      .replace("=",  '"$eq" :');
  expr = JSON.parse( "{" + expr + "}" );

  var $match = {};
  //timestamp
  $match[ COL.TIMESTAMP.id ] = {"$gte": status_db.time.begin, "$lt" : status_db.time.end };

  //probeid
  if (obj.compid)
    $match[1] = parseInt( obj.compid );

  if (collection == 'availability'){
    // for expresions not comparable right away with the parameter,
    // they require some previous calculation
    var baseDate = new Date(0);

    var $date_fn = { "$project": {
      "probe_id": "$1",
      "availability_count": "$5",
      "checks_count": "$6",
          "mins":  { "$ceil": { "$divide" : [ "$3" , 60 ] }  },
          "hour":  { "$ceil": { "$divide" : [ "$3" , 60 * 60 ] } },
          "day":   { "$ceil": { "$divide" : [ "$3" , 60  * 60 * 60] } },
          "month": { "$ceil": { "$divide" : [ "$3" , 60 * 60 * 60 * 60] } }
      }
    };

    switch ( fPeriod.selectedOption().id ) {
      case MMTDrop.constants.period.MINUTE:
      case MMTDrop.constants.period.HOUR:
        time_resolution = "$mins";
        break;
      case MMTDrop.constants.period.HALF_DAY:
      case MMTDrop.constants.period.QUARTER_DAY:
      case MMTDrop.constants.period.DAY:
        time_resolution = "$mins";
        break;
      case MMTDrop.constants.period.WEEK:
      case MMTDrop.constants.period.MONTH:
        time_resolution = "$hour";
        break;
      case MMTDrop.constants.period.YEAR:
        time_resolution = "$day";
        break;
      default:
    }

    var $aggregate_fn = {"$group": {"_id": time_resolution, "sum_available":{"$sum":"$availability_count"},"checks_count":{"$sum":"$checks_count"} } };
    var $project_fn =  {"$project": { "result": {"$divide" : ["$sum_available", "$checks_count"]} } };
    var $match_fn =   {"$match": { "result": expr } };
    var $count_fn = {"$group": {"_id": null, "count": {"$sum": 1}}}

    return { query: [ {"$match" : $match}, $date_fn, $aggregate_fn, $project_fn, $match_fn], period_groupby: fPeriod.selectedOption().id };

  }else{
    $match[ col_id ] = expr;
    var $group = {"_id": null, "count": {"$sum":1}};
    return { query: [ {"$match" : $match}, {"$group": $group}, ], period_groupby: fPeriod.selectedOption().id };
  }

}
