
function timeit(f, N, S) {
   var start, timeTaken;
   var stats = {min: 1e50, max: 0, N: 0, sum: 0, sqsum: 0};
   var i;
   for (i = 0; i < S; ++i) {
      start = Date.now();
      f(N);
      timeTaken = Date.now() - start;

      stats.min = Math.min(timeTaken, stats.min);
      stats.max = Math.max(timeTaken, stats.max);
      stats.sum += timeTaken;
      stats.sqsum += timeTaken * timeTaken;
      stats.N++
   }

   var mean = stats.sum / stats.N;
   var sqmean = stats.sqsum / stats.N;

   return {min: stats.min, max: stats.max, mean: mean, spread: Math.sqrt(sqmean - mean * mean)};
}

//random string
const stringArr = [
   "0GEHJWfCxL",
   "hW0OFD6ICJ",
   "oxtdDDoTVQ",
   "LpDS7oHak5",
   "w4CQu9yQJk",
   "mKmDme02Ui",
   "6VeAa2ieDq",
   "tZndzenMfZ",
   "e80RlBNqXQ",
   "8Cb3kE08st",
   "UYpKZdcAsN",
   "cQIPUSzq3h",
   "xCGSi8GFnu",
   "xbIlN6iA1k",
   "DScjHnbNp8",
   "nSxmfOS2kB",
   "1CBDgWwNYn",
   "2CDdrhC7sk",
   "aBNmmBuPo6",
   "s735mHCgJH"
];

function _plus( N ){
   var s = "", i, j;
   for( j=0; j<N; j++ )
      for( i=0; i<stringArr.length; i++ )
         s += stringArr[i];
   return s;
}

function _concat( N ){
   var s = "", i, j;
   for( j=0; j<N; j++ )
      for( i=0; i<stringArr.length; i++ )
         s.concat( stringArr[i] );
   return s;
}

function _join( N ){
   var s = [], i, j;
   for( j=0; j<N; j++ )
      for( var i=0; i<stringArr.length; i++ )
         s.push( stringArr[i] );
   return s.join("");
}

const LOOP = 100000;

gc();  
console.log("plus   = " + JSON.stringify(timeit(_plus  , LOOP, 50)));
console.log( process.memoryUsage() );

gc();  
console.log("concat = " + JSON.stringify(timeit(_concat, LOOP, 50)));
console.log( process.memoryUsage() );

gc();  
console.log("join   = " + JSON.stringify(timeit(_join  , LOOP, 50)));
console.log( process.memoryUsage() );