var obj_long = {
  "d434d08a-2750-11e6-9306-fa163eeff5a81" : 1,
  "d434d08a-2750-11e6-9306-fa163eefc5a82" : 1,
  "d434d08a-2750-11e6-9306-fa163eefg5a83" : 1,
  "d434d08a-2750-11e6-9306-fa163eefe5a84" : 1,
  "d434d08a-2750-11e6-9306-fa163eefg5a85" : 1,
}
var obj_short_alpha = {
  "a" : 1,
  "b" : 1,
  "c" : 1,
  "d" : 1,
  "e" : 1,
}
var obj_short_number = {
  "0" : 1,
  "1" : 1,
  "2" : 1,
  "3" : 1,
  "4" : 1,
}
function calcul( obj ){
  var total = 0;
  var start = Date.now();
  for( var j=0; j<9000000; j++)
     for( var i in obj)
        total += obj[i];
  var end = Date.now();
  console.log("sum = "+ total +", took: " + (end - start));
}

function calcul_2( obj ){
  var total = 0;
  var start = Date.now();
  for( var j=0; j<9000000; j++)
     for( var i=0;i<5;i++)
        total += obj[i];
  var end = Date.now();
  console.log("sum = "+ total +", took: " + (end - start));
}

calcul( obj_long );
calcul( obj_long );
calcul( obj_short_alpha );
calcul( obj_short_alpha );
calcul( obj_short_number ); //slowest
calcul( obj_short_number ); //slowest
calcul_2( obj_short_number );//fastest
calcul_2( obj_short_number );//fastest

/*result on macboo pro 13 (Retina, 13 pouces, mi 2014)
//node v5.8.0

sum = 45000000, took: 163
sum = 45000000, took: 191
sum = 45000000, took: 179
sum = 45000000, took: 179
sum = 45000000, took: 7503
sum = 45000000, took: 7452
sum = 45000000, took: 80
sum = 45000000, took: 90
*/
