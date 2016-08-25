var arr = [];
arr.length = 500500;
arr.fill(7);

var total = 0;

var start = Date.now();
   for( var i in arr)
      total += arr[i];
var end = Date.now();
console.log(" took: " + (end - start));

var start = Date.now();
   for( var i=0; i<arr.length; i++)
      total += arr[i];
var end = Date.now();
console.log(" took: " + (end - start));


var start = Date.now();
   for( var i=0; i<arr.length; i++)
      total += arr[i];
var end = Date.now();
console.log(" took: " + (end - start));

var start = Date.now();
   for( var i in arr)
      total += arr[i];
var end = Date.now();
console.log(" took: " + (end - start));


