
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

var variable1 = 10;
var variable2 = 10;
var variable3 = 10;
var variable4 = 10;
var variable5 = 10;
var variable6 = 10;
var variable7 = 10;
var variable8 = 10;
var variable9 = 10;
var variable10 = 10;

function varAccess(N) {
    var i, sum;
    for (i = 0; i < N; ++i) {
        sum += variable1;
        sum += variable2;
        sum += variable3;
        sum += variable4;
        sum += variable5;
        sum += variable6;
        sum += variable7;
        sum += variable8;
        sum += variable9;
        sum += variable10;
    }
    return sum;
}

const constant1 = 10;
const constant2 = 10;
const constant3 = 10;
const constant4 = 10;
const constant5 = 10;
const constant6 = 10;
const constant7 = 10;
const constant8 = 10;
const constant9 = 10;
const constant10 = 10;

function constAccess(N) {
    var i, sum;
    for (i = 0; i < N; ++i) {
        sum += constant1;
        sum += constant2;
        sum += constant3;
        sum += constant4;
        sum += constant5;
        sum += constant6;
        sum += constant7;
        sum += constant8;
        sum += constant9;
        sum += constant10;
    }
    return sum;
}


function control(N) {
    var i, sum;
    for (i = 0; i < N; ++i) {
        sum += 10;
        sum += 10;
        sum += 10;
        sum += 10;
        sum += 10;
        sum += 10;
        sum += 10;
        sum += 10;
        sum += 10;
        sum += 10;
    }
    return sum;
}

console.log("ctl = " + JSON.stringify(timeit(control, 10000000, 50)));
console.log("con = " + JSON.stringify(timeit(constAccess, 10000000, 50)));
console.log("var = " + JSON.stringify(timeit(varAccess, 10000000, 50)));