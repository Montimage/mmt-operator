#!/bin/bash

pwd

TARGET=/home/ubuntu/musa/operator
USER=ubuntu
PORT=22
IP=37.48.247.124 

RUN="/home/ubuntu/musa/start-operator"


rsync -av --progress -e "ssh -i ~/.ssh/musa-aimes.pem -p $PORT" --exclude /public/db_backup  --exclude /dist  --exclude /.git -rca ./www $USER@$IP:$TARGET
ssh -i ~/.ssh/musa-aimes.pem -p $PORT $USER@$IP "$RUN"

