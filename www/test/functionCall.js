var REPEATS = 100;

var NUMBER_COUNT = 10000000;

function _add (n1, n2) {
   return n1 + n2;
}
a = 4;
b = 5;
var alternatives = [
   {
      name: "No function call",
      action: function (){
         var c;
         for (var i = 0; i < NUMBER_COUNT; i++) {
            c = a + i;
         }
      }
   },
   {
      name: "Function call",
      action: function (){
         var c;
         for (var i = 0; i < NUMBER_COUNT; i++) {
            c = _add(a,i);
         }
      }
   },
   {
      name: "Function inside function",
      action: function (){
         var add = function(x,y){return x+y};
         var c;
         for (var i = 0; i < NUMBER_COUNT; i++) {
            c = add(a,i);
         }
      }
   }
   ];

alternatives.forEach(function(alternative){
   var start = new Date();
   var repeat = REPEATS;
   for (var i=0; i< repeat;i++) {
      alternative.action();
   }
   var end = new Date();
   var totalMs = end.valueOf() - start.valueOf();
   var averageMs = totalMs/repeat;

   var result = alternative.name + " took " + averageMs + "ms - (" + repeat + " times, total time: " + totalMs + "ms)";
   console.log(result);
});
