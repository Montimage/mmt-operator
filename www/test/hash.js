// Author: Arda Basoglu, ardabasoglu@gmail.com
// This example demonstrates the use of map like (like hash map in Java and dictionary in C#) data structure
// The code is tested with a machine Node.js installed
// If you have Node.js installed on your machine run the script by writing "node map.example.js" on the console

// create a map
var map = {};

// Add key, value pairs into the map with random strings
for (var i = 0; i < 500; i++) {
    var item =generateRandomString();
    var value = generateRandomString();
    map[item] = value;
};

// Output every key, value pair onto the screen
for (var i in map) {
    console.log("Key: " + i + ", Value: " + map[i]);
}

// The function required for generating random strings
function generateRandomString()
{
    var randomString = "";
    var randomStringSource = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ){
        randomString += randomStringSource.charAt(Math.floor(Math.random() * randomStringSource.length));
    }

    return randomString;
}
