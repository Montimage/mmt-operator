var http = require('http');
var fs = require('fs');
var file, request;

var index = 0;

function download() {
    index++;
    console.log("\nDownloading " + index );
    file = fs.createWriteStream(index + "ubuntu.iso");
    request = http.get("http://releases.ubuntu.com/14.04.3/ubuntu-14.04.3-desktop-amd64.iso", function (response) {
        process.stdout.write(".");
        response.pipe(file);
        file.on('finish', function () {
            file.close(download);
        });
    });
}

download();
