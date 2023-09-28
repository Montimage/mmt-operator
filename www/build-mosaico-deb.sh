#!/bin/bash

cp config-mosaico.json config.json
npm run build
npm run build-deb

# to test using docker ==> use ubuntu 22.10
# docker run --rm -it -v$PWD:/tmp/a ubuntu:22.10